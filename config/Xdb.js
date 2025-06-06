const Joi = require('joi');
const mysql = require('mysql2/promise');



class Xdb {
    constructor(waitForConnections = true, connectionLimit = 10, queueLimit = 0) {
        this.waitForConnections = waitForConnections;
        this.connectionLimit = connectionLimit;
        this.queueLimit = queueLimit;
        this.pool = null;
        this.show = false;
    }
    #show(...log) {
        if (this.show) console.log(log);
    }

    async connect() {
        if (!this.pool)
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                waitForConnections: this.waitForConnections,
                connectionLimit: this.connectionLimit,
                queueLimit: this.queueLimit
            });
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
    async query(sql, params = [], executor) {
        const exec = executor || this.pool;
        let { error } = Joi.object({
            sql: Joi.string().required(),
            params: Joi.array().optional()
        }).validate({ sql, params });
        if (error) throw error;

        try {
            const [results] = await exec.execute(sql, params);
            return results;
        } catch (err) {
            this.#show('Database query error:', err.message);
            throw err;
        }
    }

    async select(tableStr, columns = [], where, params = [], options = {}, executor) {
        const { table, alias } = this.#parseTableAlias(tableStr);
        let { error } = Joi.object({
            table: Joi.string().required(),
            columns: Joi.array().items(Joi.string()).optional(),
            where: Joi.string().optional(),
            params: Joi.array().optional(),
            options: this.queryOptionsSchema
        }).validate({ table, columns, where, params, options });
        if (error) throw error;

        try {
            const selectClause = options.countOnly
                ? 'SELECT COUNT(*) AS count'
                : `SELECT${options.distinct ? ' DISTINCT' : ''} ${columns.length ? columns.join(', ') : '*'}`;

            let query = `${selectClause} FROM \`${table}\`${alias ? ` AS ${alias}` : ''}`;
            if (where) query += ` WHERE ${where}`;
            query += ' ' + this.#buildQueryOptions(options);
            if (options.forUpdate) query += ' FOR UPDATE';

            const finalParams = [...(params || []), ...(options.havingParams || [])];
            const result = await this.query(query, finalParams, executor);

            return options.countOnly ? result[0].count : result;
        } catch (err) {
            this.#show('Database select error:', err);
            throw err;
        }
    }

    async selectCount(table, where, params = [], executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            where: Joi.string().optional(),
            params: Joi.array().optional()
        }).validate({ table, where, params });
        if (error) throw error;

        try {
            let query = `SELECT COUNT(*) AS count FROM \`${table}\``;
            if (where) query += ` WHERE ${where}`;
            const [{ count }] = await this.query(query, params, executor);
            return count;
        } catch (err) {
            this.#show('Database selectCount error:', err);
            throw err;
        }
    }

    async selectById(table, columns, id, executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            columns: Joi.array().items(Joi.string()).optional(),
            id: Joi.alternatives().try(Joi.string(), Joi.number().integer()).required()
        }).validate({ table, columns, id });
        if (error) throw error;
        return this.select(table, columns, 'id = ?', [id], executor);
    }

    async insert(table, data, executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            data: Joi.object().required()
        }).validate({ table, data });
        if (error) throw error;

        try {
            data = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));
            const keys = Object.keys(data).map(key => `\`${key}\``).join(', ');
            const values = Object.values(data);
            const placeholders = values.map(() => '?').join(', ');

            const query = `INSERT INTO \`${table}\` (${keys}) VALUES (${placeholders})`;
            const result = await this.query(query, values, executor);
            return result.insertId;
        } catch (err) {
            this.#show('Database insert error:', err);
            throw err;
        }
    }

    async insertMany(table, dataArr, executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            dataArr: Joi.array().items(Joi.object()).required()
        }).validate({ table, dataArr });
        if (error) throw error;

        try {
            if (!Array.isArray(dataArr) || dataArr.length === 0) {
                throw new Error('Dữ liệu đầu vào phải là một mảng và không được rỗng');
            }
            const ids = await Promise.all(dataArr.map(row => this.insert(table, row, executor)));
            return ids;
        } catch (err) {
            this.#show('Database insertMany error:', err);
            throw err;
        }
    }

    async update(table, data, where, params = [], limit, executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            data: Joi.object().required(),
            where: Joi.string().optional(),
            params: Joi.array().optional(),
            limit: Joi.number().integer().optional()
        }).validate({ table, data, where, params, limit });
        if (error) throw error;

        try {
            const setQuery = Object.keys(data).map(key => `\`${key}\` = ?`).join(', ');
            const values = [...Object.values(data), ...params];
            let query = `UPDATE \`${table}\` SET ${setQuery} WHERE ${where}`;
            if (limit) query += ` LIMIT ${limit}`;

            const result = await this.query(query, values, executor);
            return result.affectedRows;
        } catch (err) {
            this.#show('Database update error:', err);
            throw err;
        }
    }

    async delete(table, where, params = [], limit, execute) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            where: Joi.string().optional(),
            params: Joi.array().optional(),
            limit: Joi.number().integer().optional()
        }).validate({ table, where, params, limit });
        if (error) throw error;

        try {
            let query = `DELETE FROM \`${table}\` WHERE ${where}`;
            if (limit) query += ` LIMIT ${limit}`;

            const result = await this.query(query, params, execute);
            return result.affectedRows;
        } catch (err) {
            this.#show('Database delete error:', err);
            throw err;
        }
    }

    async replace(table, data, execute) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            data: Joi.object().required()
        }).validate({ table, data });
        if (error) throw error;

        try {
            const keys = Object.keys(data).map(key => `\`${key}\``).join(', ');
            const values = Object.values(data);
            const placeholders = values.map(() => '?').join(', ');
            const query = `REPLACE INTO \`${table}\` (${keys}) VALUES (${placeholders})`;

            const result = await this.query(query, values, execute);
            return result.insertId;
        } catch (err) {
            this.#show('Database replace error:', err);
            throw err;
        }
    }

    async importData(table, dataArray, keyFields = ['id'], batchSize = 1000, execute) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            dataArray: Joi.array().min(1).items(Joi.object().min(1)).required(),
            keyFields: Joi.array().items(Joi.string()).required(),
            batchSize: Joi.number().min(1).default(1000)
        }).validate({ table, dataArray, keyFields, batchSize });
        if (error) throw error;

        try {
            const columns = Object.keys(dataArray[0]);
            const quotedColumns = columns.map(col => `\`${col}\``).join(', ');
            const updateClause = columns
                .filter(col => !keyFields.includes(col))
                .map(col => `\`${col}\` = VALUES(\`${col}\`)`)
                .join(', ');

            let totalInserted = 0;

            for (let i = 0; i < dataArray.length; i += batchSize) {
                const batch = dataArray.slice(i, i + batchSize);
                const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;
                const allPlaceholders = batch.map(() => rowPlaceholders).join(', ');
                const values = batch.flatMap(row => columns.map(col => row[col]));

                const query = updateClause
                    ? `INSERT INTO \`${table}\` (${quotedColumns}) VALUES ${allPlaceholders} ON DUPLICATE KEY UPDATE ${updateClause}`
                    : `INSERT IGNORE INTO \`${table}\` (${quotedColumns}) VALUES ${allPlaceholders}`;

                const [result] = await this.query(query, values, execute);
                totalInserted += result.affectedRows;

                this.#show(`✅ Đã xử lý batch ${i + 1} → ${i + batch.length} / ${dataArray.length}`);
            }

            return totalInserted;
        } catch (err) {
            this.#show('Database importData (batched) error:', err);
            throw err;
        }
    }

    async transaction(callback) {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();

        const tx = {
            select: (table, columns, where, params, options) => this.select(table, columns, where, params, options, connection),
            selectCount: (table, where, params) => this.selectCount(table, where, params, connection),
            selectById: (table, id) => this.selectById(table, id, connection),
            selectJoin: (from, columns, joins, where, params, options) => this.selectJoin(from, columns, joins, where, params, options, connection),
            insert: (table, data) => this.insert(table, data, connection),
            insertMany: (table, dataArr) => this.insertMany(table, dataArr, connection),
            update: (table, data, where, params, limit) => this.update(table, data, where, params, limit, connection),
            delete: (table, where, params, limit) => this.delete(table, where, params, limit, connection),
            replace: (table, data) => this.replace(table, data, connection),
            importData: (table, dataArray, keyFields, batchSize) => this.importData(table, dataArray, keyFields, batchSize, connection),
            exists: (table, where, params) => this.exists(table, where, params, connection),
            query: (sql, params) => this.query(sql, params, connection)
        };

        try {
            const result = await callback(tx);
            await connection.commit();
            return result;
        } catch (err) {
            await connection.rollback();
            this.#show('Database transaction error:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async selectJoin(fromStr, columns = [], joins = [], where, params = [], options = {}, executor) {
        // Kiểm tra dữ liệu đầu vào bằng Joi
        const schema = Joi.object({
            fromStr: Joi.string().required(),
            columns: Joi.array().items(Joi.string()).optional(),
            joins: Joi.array().items(
                Joi.object({
                    table: Joi.string().required(),
                    on: Joi.string().required(),
                    type: Joi.string().valid('INNER', 'LEFT', 'RIGHT', 'FULL', 'LEFT OUTER', 'RIGHT OUTER').optional()
                })
            ).optional(),
            where: Joi.string().optional(),
            params: Joi.array().optional(),
            options: this.queryOptionsSchema
        });

        const { error } = schema.validate({ fromStr, columns, joins, where, params, options });
        if (error) throw error;

        // Tách alias bảng gốc
        const { table: from, alias: fromAlias } = this.#parseTableAlias(fromStr);
        const selectClause = options.countOnly
            ? 'SELECT COUNT(*) AS count'
            : `SELECT${options.distinct ? ' DISTINCT' : ''} ${columns.length ? columns.join(', ') : '*'}`;

        try {
            // FROM + alias
            const fromPart = fromAlias ? `\`${from}\` AS ${fromAlias}` : `\`${from}\``;
            let query = `${selectClause} FROM ${fromPart}`;

            // JOINs
            for (const j of joins || []) {
                const { table: joinTable, alias: joinAlias } = this.#parseTableAlias(j.table);
                const joinType = (j.type || 'INNER').toUpperCase();
                const joinPart = joinAlias ? `\`${joinTable}\` AS ${joinAlias}` : `\`${joinTable}\``;
                query += ` ${joinType} JOIN ${joinPart} ON ${j.on}`;
            }

            // WHERE + các option khác
            if (where) query += ` WHERE ${where}`;
            query += ' ' + this.#buildQueryOptions(options);
            if (options.forUpdate) query += ' FOR UPDATE';

            const finalParams = [...(params || []), ...(options.havingParams || [])];
            const result = await this.query(query, finalParams, executor);

            return options.countOnly ? result[0].count : result;
        } catch (err) {
            this.#show('Database selectJoin error:', err.message);
            throw err;
        }
    }


    async exists(table, where, params = [], executor) {
        let { error } = Joi.object({
            table: Joi.string().required(),
            where: Joi.string().required(),
            params: Joi.array().optional()
        }).validate({ table, where, params });
        if (error) throw error;

        try {
            const query = `SELECT 1 FROM \`${table}\` WHERE ${where} LIMIT 1`;
            const results = await this.query(query, params, executor);
            return results.length > 0;
        } catch (err) {
            this.#show('Database exists error:', err);
            throw err;
        }
    }
    #parseTableAlias(tableStr) {
        const [table, alias] = tableStr.trim().split(/\s+/);
        return { table, alias: alias || null };
    }

    #buildQueryOptions(options = {}, queryParts = []) {
        if (options.groupBy) queryParts.push(`GROUP BY ${options.groupBy}`);
        if (options.having) queryParts.push(`HAVING ${options.having}`);
        if (options.random) {
            queryParts.push('ORDER BY RAND()');
        } else if (options.orderBy) {
            queryParts.push(`ORDER BY ${options.orderBy}`);
        }
        if (options.limit) queryParts.push(`LIMIT ${options.limit}`);
        if (options.offset) queryParts.push(`OFFSET ${options.offset}`);
        return queryParts.join(' ');
    }
    queryOptionsSchema = Joi.object({
        distinct: Joi.boolean().optional(),
        groupBy: Joi.string().optional(),
        having: Joi.string().optional(),
        havingParams: Joi.array().optional(),
        orderBy: Joi.string().optional(),
        limit: Joi.number().integer().optional(),
        offset: Joi.number().integer().optional(),
        random: Joi.boolean().optional(),
        countOnly: Joi.boolean().optional(),
        forUpdate: Joi.boolean().optional()
    }).optional();
}


module.exports = new Xdb();

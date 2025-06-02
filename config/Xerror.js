class Xerror extends Error {
    constructor(message, status = 500, code = "APP_ERROR", data = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = Xerror;

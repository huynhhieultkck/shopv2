
DROP DATABASE IF EXISTS `shopv2`;
-- Tạo Database (nếu chưa có)
CREATE DATABASE IF NOT EXISTS `shopv2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng Database
USE `shopv2`;
-- ============================
-- 📦 DATABASE: MMO Account Shop
-- ============================

-- 👤 USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  balance int DEFAULT 0,
  wallet VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 💰 TOPUP
CREATE TABLE topups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  bank_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 🗂️ CATEGORIES
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  image VARCHAR(255),
  description TEXT,
  parent_id INT DEFAULT NULL,
  price int NOT NULL,
  available int,
  sold int,
  enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 🛒 ORDERS
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price int NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 🧾 ACCOUNTS
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  data TEXT NOT NULL,
  status ENUM('available', 'sold', 'locked') DEFAULT 'available',
  order_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);



-- 🏦 BANKS
CREATE TABLE banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL, -- mbbank, vietcombank, etc.
  account_number VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  token VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo procedure cập nhật available/sold cho 1 category
DROP PROCEDURE IF EXISTS update_category_stats_by_id;
DELIMITER //

CREATE PROCEDURE update_category_stats_by_id(IN cat_id INT)
BEGIN
  UPDATE categories c
  LEFT JOIN (
    SELECT 
      category_id,
      SUM(status = 'available') AS available,
      SUM(status = 'sold') AS sold
    FROM accounts
    WHERE category_id = cat_id
    GROUP BY category_id
  ) a ON c.id = a.category_id
  SET 
    c.available = IFNULL(a.available, 0),
    c.sold = IFNULL(a.sold, 0)
  WHERE c.id = cat_id;
END;
//
DELIMITER ;

-- Trigger AFTER INSERT
DROP TRIGGER IF EXISTS trg_after_insert_accounts;
DELIMITER //

CREATE TRIGGER trg_after_insert_accounts
AFTER INSERT ON accounts
FOR EACH ROW
BEGIN
  CALL update_category_stats_by_id(NEW.category_id);
END;
//
DELIMITER ;

-- Trigger AFTER DELETE
DROP TRIGGER IF EXISTS trg_after_delete_accounts;
DELIMITER //

CREATE TRIGGER trg_after_delete_accounts
AFTER DELETE ON accounts
FOR EACH ROW
BEGIN
  CALL update_category_stats_by_id(OLD.category_id);
END;
//
DELIMITER ;

-- Trigger AFTER UPDATE
DROP TRIGGER IF EXISTS trg_after_update_accounts;
DELIMITER //

CREATE TRIGGER trg_after_update_accounts
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
  IF OLD.category_id != NEW.category_id THEN
    CALL update_category_stats_by_id(OLD.category_id);
    CALL update_category_stats_by_id(NEW.category_id);
  ELSE
    CALL update_category_stats_by_id(NEW.category_id);
  END IF;
END;
//
DELIMITER ;



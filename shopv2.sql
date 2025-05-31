
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
  name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  balance DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 💰 TOPUP REQUESTS
CREATE TABLE topup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_code VARCHAR(100) NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
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
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);


-- 🧾 ACCOUNTS
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  recovery_email VARCHAR(255),
  twofa_code VARCHAR(255),
  cookies TEXT,
  backup_codes TEXT,
  notes TEXT,
  price DECIMAL(12,2) NOT NULL,
  status ENUM('available', 'sold', 'locked') DEFAULT 'available',
  tags VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 🛒 ORDERS
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 🧾 ORDER ITEMS
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  account_id INT,
  account_snapshot JSON NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 🎁 COUPONS
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percent', 'fixed') DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL,
  usage_limit INT DEFAULT 0,
  used_count INT DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🧾 COUPON USAGE HISTORY
CREATE TABLE coupon_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT,
  user_id INT,
  order_id INT,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
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

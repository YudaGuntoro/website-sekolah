CREATE DATABASE IF NOT EXISTS cendekia_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cendekia_cms;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(50) NULL,
  role VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cms_username (username),
  UNIQUE KEY uq_cms_email (email)
) ENGINE=InnoDB;

-- Local demo account: admin / admin123. Replace before deployment.
INSERT IGNORE INTO users (username, full_name, email, role, status, password_hash, password_salt)
VALUES ('admin', 'Administrator Cendekia', 'admin@cendekia.local', 'ADMIN', 'ACTIVE',
 'mV/QhZOhh7mvmWj0P1RgeXm3hZB1AkKHY5jfEcrC7PE=', 'Y21tcy1hZG1pbi1zYWx0LXYx');

CREATE TABLE IF NOT EXISTS school_content (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  Collection VARCHAR(40) NOT NULL,
  Title VARCHAR(200) NOT NULL,
  Slug VARCHAR(220) NOT NULL,
  Category VARCHAR(200) NOT NULL DEFAULT '',
  Summary VARCHAR(1000) NOT NULL DEFAULT '',
  Body LONGTEXT NOT NULL,
  ImageUrl VARCHAR(500) NOT NULL DEFAULT '',
  PostUrl VARCHAR(1000) NOT NULL DEFAULT '',
  Status VARCHAR(20) NOT NULL DEFAULT 'Draft',
  PublishedAt DATETIME(6) NULL,
  SortOrder INT NOT NULL DEFAULT 0,
  Version INT NOT NULL DEFAULT 1,
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UpdatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_content_slug (Collection, Slug),
  INDEX ix_content_status (Collection, Status),
  CONSTRAINT ck_content_status CHECK (Status IN ('Draft', 'Published')),
  CONSTRAINT ck_content_sort CHECK (SortOrder >= 0)
) ENGINE=InnoDB;

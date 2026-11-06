USE cendekia_cms;
CREATE TABLE IF NOT EXISTS auth_sessions (
  Id CHAR(36) NOT NULL PRIMARY KEY,
  UserId INT NOT NULL,
  CreatedAt DATETIME(6) NOT NULL,
  ExpiresAt DATETIME(6) NOT NULL,
  RevokedAt DATETIME(6) NULL,
  INDEX ix_auth_session_user(UserId),
  INDEX ix_auth_session_expiry(ExpiresAt),
  CONSTRAINT fk_auth_session_user FOREIGN KEY(UserId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_auth_session_expiry CHECK(ExpiresAt>CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

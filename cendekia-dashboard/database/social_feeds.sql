USE cendekia_cms;
-- Idempotent upgrade for existing installations; preserves all content.
SET @social_column_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'school_content' AND COLUMN_NAME = 'PostUrl');
SET @social_upgrade = IF(@social_column_exists = 0,
  'ALTER TABLE school_content ADD COLUMN PostUrl VARCHAR(1000) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE social_upgrade_stmt FROM @social_upgrade;
EXECUTE social_upgrade_stmt;
DEALLOCATE PREPARE social_upgrade_stmt;

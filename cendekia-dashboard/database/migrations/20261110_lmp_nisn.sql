-- Backup before applying. Historical NISN stays NULL until staff verifies it.
USE cendekia_cms;
CREATE TEMPORARY TABLE lmp_nisn_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO lmp_nisn_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
SET @lmp_nisn_ddl=IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='lmp_applications' AND COLUMN_NAME='Nisn'),'SELECT 1','ALTER TABLE lmp_applications ADD COLUMN Nisn VARCHAR(10) NULL, ADD KEY ix_lmp_nisn(Nisn), ADD CONSTRAINT ck_lmp_nisn CHECK(Nisn IS NULL OR Nisn REGEXP ''^[0-9]{10}$'')');
PREPARE lmp_nisn_statement FROM @lmp_nisn_ddl;
EXECUTE lmp_nisn_statement;
DEALLOCATE PREPARE lmp_nisn_statement;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261110_lmp_nisn',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE lmp_nisn_guard;

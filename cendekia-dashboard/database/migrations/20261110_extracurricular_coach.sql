-- Back up cendekia_cms first. Existing content and category labels are preserved.
USE cendekia_cms;
CREATE TEMPORARY TABLE extracurricular_coach_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO extracurricular_coach_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
SET @extracurricular_coach_ddl=IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='school_content' AND COLUMN_NAME='CoachName'),'SELECT 1','ALTER TABLE school_content ADD COLUMN CoachName VARCHAR(200) NULL');
PREPARE extracurricular_coach_statement FROM @extracurricular_coach_ddl;
EXECUTE extracurricular_coach_statement;
DEALLOCATE PREPARE extracurricular_coach_statement;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261110_extracurricular_coach',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE extracurricular_coach_guard;

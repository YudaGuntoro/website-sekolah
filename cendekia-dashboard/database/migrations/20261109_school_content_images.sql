-- Backup cendekia_cms before applying. Legacy image URLs are preserved.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_images_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_images_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS school_content_images (
 Id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL PRIMARY KEY,
 ContentType VARCHAR(30) NOT NULL,
 Content MEDIUMBLOB NOT NULL,
 CONSTRAINT ck_school_image_type CHECK(ContentType IN('image/jpeg','image/png','image/webp')),
 CONSTRAINT ck_school_image_size CHECK(OCTET_LENGTH(Content) BETWEEN 1 AND 2097152)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @cms_image_ddl=IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='school_content' AND COLUMN_NAME='ImageId'),'SELECT 1','ALTER TABLE school_content ADD COLUMN ImageId CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL, ADD UNIQUE KEY uq_school_content_image(ImageId), ADD CONSTRAINT fk_school_content_image FOREIGN KEY(ImageId) REFERENCES school_content_images(Id)');
PREPARE cms_image_statement FROM @cms_image_ddl;
EXECUTE cms_image_statement;
DEALLOCATE PREPARE cms_image_statement;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261109_school_content_images',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_images_guard;

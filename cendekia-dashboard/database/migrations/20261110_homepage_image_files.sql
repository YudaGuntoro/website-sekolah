-- Backup before applying. Existing homepage URLs stay unchanged.
USE cendekia_cms;
CREATE TEMPORARY TABLE homepage_image_files_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO homepage_image_files_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS homepage_image_files (
  HomepageImagesId INT NOT NULL,
  Slot VARCHAR(10) NOT NULL,
  ContentType VARCHAR(30) NOT NULL,
  OriginalLength INT NOT NULL,
  Content MEDIUMBLOB NOT NULL,
  PRIMARY KEY(HomepageImagesId,Slot),
  CONSTRAINT fk_homepage_image_files FOREIGN KEY(HomepageImagesId) REFERENCES homepage_images(Id) ON DELETE CASCADE,
  CONSTRAINT ck_homepage_image_slot CHECK(Slot IN('hero','direction','program')),
  CONSTRAINT ck_homepage_image_type CHECK(ContentType IN('image/jpeg','image/png','image/webp')),
  CONSTRAINT ck_homepage_image_length CHECK(OriginalLength BETWEEN 1 AND 1048576 AND OCTET_LENGTH(Content) BETWEEN 1 AND OriginalLength)
) ENGINE=InnoDB;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261110_homepage_image_files',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE homepage_image_files_guard;

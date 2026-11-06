-- Versioned MySQL 8 migration. Stop the old API and take a database backup first.
-- Repeatable: a successful backfill is recorded once; cleanup resumes after interruption.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_migration_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_migration_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS schema_migrations (Version VARCHAR(80) NOT NULL PRIMARY KEY, AppliedAt DATETIME(6) NOT NULL) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS schema_legacy_payloads (
  MigrationVersion VARCHAR(80) NOT NULL, SourceTable VARCHAR(80) NOT NULL, RecordId INT NOT NULL,
  Payload LONGTEXT NOT NULL, PRIMARY KEY(MigrationVersion, SourceTable, RecordId), CHECK(JSON_VALID(Payload))
) ENGINE=InnoDB;
DELIMITER $$
DROP PROCEDURE IF EXISTS cms_add_column$$
CREATE PROCEDURE cms_add_column(IN tbl VARCHAR(80), IN col VARCHAR(80), IN definition TEXT)
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=tbl AND COLUMN_NAME=col) THEN
    SET @ddl=CONCAT('ALTER TABLE ', CHAR(96), tbl, CHAR(96), ' ADD COLUMN ', CHAR(96), col, CHAR(96), ' ', definition);
    PREPARE statement FROM @ddl; EXECUTE statement; DEALLOCATE PREPARE statement;
  END IF;
END$$
DROP PROCEDURE IF EXISTS cms_drop_column$$
CREATE PROCEDURE cms_drop_column(IN tbl VARCHAR(80), IN col VARCHAR(80))
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=tbl AND COLUMN_NAME=col) THEN
    SET @ddl=CONCAT('ALTER TABLE ', CHAR(96), tbl, CHAR(96), ' DROP COLUMN ', CHAR(96), col, CHAR(96));
    PREPARE statement FROM @ddl; EXECUTE statement; DEALLOCATE PREPARE statement;
  END IF;
END$$
DELIMITER ;
CALL cms_add_column('lmp_settings', 'Title', 'VARCHAR(150) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'Introduction', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'Enabled', 'BOOLEAN NOT NULL DEFAULT FALSE');
CALL cms_add_column('lmp_settings', 'RegistrationStart', 'DATE NULL');
CALL cms_add_column('lmp_settings', 'RegistrationEnd', 'DATE NULL');
CALL cms_add_column('lmp_settings', 'CompetitionDate', 'DATE NULL');
CALL cms_add_column('lmp_settings', 'CompetitionTime', 'VARCHAR(100) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'Venue', 'VARCHAR(300) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'AnnouncementDate', 'DATE NULL');
CALL cms_add_column('lmp_settings', 'AnnouncementDetails', 'VARCHAR(300) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'FeeAmount', 'INT NOT NULL DEFAULT 0');
CALL cms_add_column('lmp_settings', 'PaymentDetails', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'DocumentInstructions', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'DocumentRequired', 'BOOLEAN NOT NULL DEFAULT FALSE');
CALL cms_add_column('lmp_settings', 'TestDetails', 'VARCHAR(1500) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'Benefits', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'AfterSubmit', 'VARCHAR(1500) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_settings', 'WhatsappGroupUrl', 'VARCHAR(300) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'Introduction', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'FeeAmount', 'INT NOT NULL DEFAULT 0');
CALL cms_add_column('spmb_information', 'PaymentDescription', 'VARCHAR(300) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'BankName', 'VARCHAR(150) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'AccountNumber', 'VARCHAR(100) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'AccountHolder', 'VARCHAR(150) NOT NULL DEFAULT ''''');
CALL cms_add_column('spmb_information', 'BrochureUrl', 'VARCHAR(1000) NOT NULL DEFAULT ''''');
CALL cms_add_column('lmp_applications','SubjectId','INT NULL');
CREATE TABLE IF NOT EXISTS school_missions (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, IdentityId INT NOT NULL, Position INT NOT NULL,
  Title VARCHAR(150) NOT NULL, Text VARCHAR(2000) NOT NULL,
  UNIQUE KEY uq_mission_position(IdentityId,Position), CHECK(Position>0),
  CONSTRAINT fk_mission_identity FOREIGN KEY(IdentityId) REFERENCES school_identity(Id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS spmb_information_steps (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, InformationId INT NOT NULL, Position INT NOT NULL,
  Title VARCHAR(150) NOT NULL, Description VARCHAR(3000) NOT NULL, Icon VARCHAR(20) NOT NULL, ShowPayment BOOLEAN NOT NULL,
  UNIQUE KEY uq_spmb_step_position(InformationId,Position), CHECK(Position>0), CHECK(Icon IN('register','folder','payment','test','check','book')),
  CONSTRAINT fk_step_information FOREIGN KEY(InformationId) REFERENCES spmb_information(Id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS spmb_document_requirements (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, InformationId INT NOT NULL, ApplicantType VARCHAR(10) NOT NULL,
  Position INT NOT NULL, Description VARCHAR(500) NOT NULL,
  UNIQUE KEY uq_spmb_document_position(InformationId,ApplicantType,Position), CHECK(Position>0), CHECK(ApplicantType IN('new','transfer')),
  CONSTRAINT fk_requirement_information FOREIGN KEY(InformationId) REFERENCES spmb_information(Id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS lmp_subjects (
  Id INT NOT NULL PRIMARY KEY, Code VARCHAR(30) NOT NULL, Name VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_subject_code(Code), UNIQUE KEY uq_subject_name(Name)
) ENGINE=InnoDB;
INSERT IGNORE INTO lmp_subjects VALUES (1,'matematika','Matematika'),(2,'bahasa-indonesia','Bahasa Indonesia'),(3,'bahasa-inggris','Bahasa Inggris');
CREATE TABLE IF NOT EXISTS lmp_application_documents (
  ApplicationId INT NOT NULL PRIMARY KEY, Content MEDIUMBLOB NOT NULL,
  CONSTRAINT fk_document_application FOREIGN KEY(ApplicationId) REFERENCES lmp_applications(Id) ON DELETE CASCADE,
  CHECK(OCTET_LENGTH(Content)<=2097152)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS school_content_collections (Code VARCHAR(40) NOT NULL PRIMARY KEY) ENGINE=InnoDB;
INSERT IGNORE INTO school_content_collections VALUES ('berita'),('pengumuman'),('instagram'),('tiktok'),('profil'),('sambutan'),('guru'),('prestasi'),('fasilitas'),('program'),('kegiatan'),('ekstrakurikuler'),('osis'),('spmb');
DELIMITER $$
DROP PROCEDURE IF EXISTS cms_normalize_v1$$
CREATE PROCEDURE cms_normalize_v1()
BEGIN
  DECLARE expected_count INT DEFAULT 0;
  IF NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261106_school_normalization_v1') THEN
    IF EXISTS(SELECT 1 FROM lmp_settings WHERE NOT JSON_VALID(ConfigJson)) OR EXISTS(SELECT 1 FROM spmb_information WHERE NOT JSON_VALID(ConfigJson)) OR EXISTS(SELECT 1 FROM school_identity WHERE NOT JSON_VALID(MissionsJson)) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid legacy JSON; migration stopped without discarding it.';
    END IF;
    INSERT IGNORE INTO schema_legacy_payloads SELECT '20261106_school_normalization_v1','lmp_settings',Id,ConfigJson FROM lmp_settings;
    INSERT IGNORE INTO schema_legacy_payloads SELECT '20261106_school_normalization_v1','spmb_information',Id,ConfigJson FROM spmb_information;
    INSERT IGNORE INTO schema_legacy_payloads SELECT '20261106_school_normalization_v1','school_identity',Id,MissionsJson FROM school_identity;
    UPDATE lmp_settings SET
    `Title`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.title')), 'null'), 'Lomba Mata Pelajaran'),
    `Introduction`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.introduction')), 'null'), 'Lomba mata pelajaran untuk siswa kelas 5 dan 6 SD di SMPIT Cendekia Purwakarta.'),
    `Enabled`=CASE NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.enabled')), 'null') WHEN 'true' THEN TRUE WHEN '1' THEN TRUE ELSE FALSE END,
    `RegistrationStart`=CASE WHEN JSON_TYPE(JSON_EXTRACT(ConfigJson, '$.registrationStart'))='STRING' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.registrationStart')) AS DATE) ELSE NULL END,
    `RegistrationEnd`=CASE WHEN JSON_TYPE(JSON_EXTRACT(ConfigJson, '$.registrationEnd'))='STRING' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.registrationEnd')) AS DATE) ELSE NULL END,
    `CompetitionDate`=CASE WHEN JSON_TYPE(JSON_EXTRACT(ConfigJson, '$.competitionDate'))='STRING' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.competitionDate')) AS DATE) ELSE NULL END,
    `CompetitionTime`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.competitionTime')), 'null'), '07.30–16.00 WIB'),
    `Venue`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.venue')), 'null'), 'SMPIT Cendekia Purwakarta'),
    `AnnouncementDate`=CASE WHEN JSON_TYPE(JSON_EXTRACT(ConfigJson, '$.announcementDate'))='STRING' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.announcementDate')) AS DATE) ELSE NULL END,
    `AnnouncementDetails`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.announcementDetails')), 'null'), 'Jam dan tempat gebyar menyusul.'),
    `FeeAmount`=CAST(COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.feeAmount')), 'null'), 35000) AS SIGNED),
    `PaymentDetails`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.paymentDetails')), 'null'), 'Informasi rekening pembayaran menyusul. Hubungi panitia sebelum melakukan pembayaran.'),
    `DocumentInstructions`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.documentInstructions')), 'null'), 'Persyaratan berkas pendaftaran menyusul.'),
    `DocumentRequired`=CASE NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.documentRequired')), 'null') WHEN 'true' THEN TRUE WHEN '1' THEN TRUE ELSE FALSE END,
    `TestDetails`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.testDetails')), 'null'), 'Tes tulis berupa pilihan ganda (PG), dilaksanakan langsung di sekolah menggunakan ExamBro. Peserta dengan skor tinggi akan mengikuti tes lanjutan berupa wawancara.'),
    `Benefits`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.benefits')), 'null'), 'Snack; sertifikat bagi juara 1 dan 2; piala untuk juara umum.'),
    `AfterSubmit`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.afterSubmit')), 'null'), 'Simpan nomor pendaftaran. Panitia akan menghubungi melalui WhatsApp untuk konfirmasi berkas, pembayaran, dan petunjuk pelaksanaan lomba.'),
    `WhatsappGroupUrl`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.whatsappGroupUrl')), 'null'), '');
    UPDATE spmb_information SET
    `Introduction`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.introduction')), 'null'), 'Syarat dan alur pendaftaran siswa baru serta murid pindahan.'),
    `FeeAmount`=CAST(COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.feeAmount')), 'null'), 350000) AS SIGNED),
    `PaymentDescription`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.paymentDescription')), 'null'), 'Tunai atau transfer ke'),
    `BankName`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.bankName')), 'null'), 'BRI'),
    `AccountNumber`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.accountNumber')), 'null'), '0075 0100 2017 563'),
    `AccountHolder`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.accountHolder')), 'null'), 'SMPIT Cendekia Purwakarta'),
    `BrochureUrl`=COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(ConfigJson, '$.brochureUrl')), 'null'), '/brosur-ppdb.pdf');
    INSERT INTO school_missions(IdentityId,Position,Title,Text)
      SELECT p.Id,j.Position,j.Title,j.Text FROM school_identity p JOIN JSON_TABLE(p.MissionsJson,'$[*]' COLUMNS(Position FOR ORDINALITY,Title VARCHAR(150) PATH '$.title' ERROR ON ERROR,Text VARCHAR(2000) PATH '$.text' ERROR ON ERROR)) j ON TRUE
      ON DUPLICATE KEY UPDATE Title=VALUES(Title),Text=VALUES(Text);
    INSERT INTO spmb_information_steps(InformationId,Position,Title,Description,Icon,ShowPayment)
      SELECT p.Id,j.Position,j.Title,j.Description,j.Icon,j.ShowPayment='true' FROM spmb_information p JOIN JSON_TABLE(p.ConfigJson,'$.steps[*]' COLUMNS(Position FOR ORDINALITY,Title VARCHAR(150) PATH '$.title',Description VARCHAR(3000) PATH '$.description',Icon VARCHAR(20) PATH '$.icon',ShowPayment VARCHAR(5) PATH '$.showPayment')) j ON TRUE
      ON DUPLICATE KEY UPDATE Title=VALUES(Title),Description=VALUES(Description),Icon=VALUES(Icon),ShowPayment=VALUES(ShowPayment);
    INSERT INTO spmb_document_requirements(InformationId,ApplicantType,Position,Description)
      SELECT p.Id,'new',j.Position,j.Description FROM spmb_information p JOIN JSON_TABLE(p.ConfigJson,'$.newStudentDocuments[*]' COLUMNS(Position FOR ORDINALITY,Description VARCHAR(500) PATH '$')) j ON TRUE
      ON DUPLICATE KEY UPDATE Description=VALUES(Description);
    INSERT INTO spmb_document_requirements(InformationId,ApplicantType,Position,Description)
      SELECT p.Id,'transfer',j.Position,j.Description FROM spmb_information p JOIN JSON_TABLE(p.ConfigJson,'$.transferDocuments[*]' COLUMNS(Position FOR ORDINALITY,Description VARCHAR(500) PATH '$')) j ON TRUE
      ON DUPLICATE KEY UPDATE Description=VALUES(Description);
    UPDATE lmp_applications a JOIN lmp_subjects s ON s.Name=a.Subjects SET a.SubjectId=s.Id;
    IF EXISTS(SELECT 1 FROM lmp_applications WHERE SubjectId IS NULL) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Unknown LMP subject. Resolve legacy records before continuing.'; END IF;
    INSERT IGNORE INTO lmp_application_documents(ApplicationId,Content) SELECT Id,Document FROM lmp_applications WHERE Document IS NOT NULL;
    IF EXISTS(SELECT 1 FROM lmp_applications a LEFT JOIN lmp_application_documents d ON d.ApplicationId=a.Id WHERE a.Document IS NOT NULL AND (d.Content IS NULL OR SHA2(a.Document,256)<>SHA2(d.Content,256))) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='PDF migration verification failed.'; END IF;
    SELECT COALESCE(SUM(JSON_LENGTH(MissionsJson)),0) INTO expected_count FROM school_identity;
    IF expected_count<>(SELECT COUNT(*) FROM school_missions) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Mission migration count mismatch.'; END IF;
    SELECT COALESCE(SUM(JSON_LENGTH(ConfigJson,'$.steps')),0) INTO expected_count FROM spmb_information;
    IF expected_count<>(SELECT COUNT(*) FROM spmb_information_steps) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='SPMB step migration count mismatch.'; END IF;
    SELECT COALESCE(SUM(JSON_LENGTH(ConfigJson,'$.newStudentDocuments')+JSON_LENGTH(ConfigJson,'$.transferDocuments')),0) INTO expected_count FROM spmb_information;
    IF expected_count<>(SELECT COUNT(*) FROM spmb_document_requirements) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='SPMB document migration count mismatch.'; END IF;
    INSERT INTO schema_migrations(Version,AppliedAt) VALUES('20261106_school_normalization_v1',UTC_TIMESTAMP(6));
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND CONSTRAINT_NAME='ck_lmp_subject') THEN ALTER TABLE lmp_applications DROP CHECK ck_lmp_subject; END IF;
END$$
DELIMITER ;
CALL cms_normalize_v1();
CALL cms_drop_column('school_identity','MissionsJson');
CALL cms_drop_column('spmb_information','ConfigJson');
CALL cms_drop_column('lmp_settings','ConfigJson');
CALL cms_drop_column('lmp_applications','Subjects');
CALL cms_drop_column('lmp_applications','Document');
ALTER TABLE lmp_applications MODIFY SubjectId INT NOT NULL;
DELIMITER $$
DROP PROCEDURE IF EXISTS cms_normalize_constraints$$
CREATE PROCEDURE cms_normalize_constraints()
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='lmp_settings' AND CONSTRAINT_NAME='ck_lmp_registration_dates') THEN
    ALTER TABLE lmp_settings ADD CONSTRAINT ck_lmp_registration_dates CHECK((RegistrationStart IS NULL AND RegistrationEnd IS NULL AND Enabled=FALSE) OR (RegistrationStart IS NOT NULL AND RegistrationEnd IS NOT NULL AND RegistrationEnd>=RegistrationStart));
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='lmp_settings' AND CONSTRAINT_NAME='ck_lmp_setting_fee') THEN ALTER TABLE lmp_settings ADD CONSTRAINT ck_lmp_setting_fee CHECK(FeeAmount>=0); END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='spmb_information' AND CONSTRAINT_NAME='ck_spmb_information_fee') THEN ALTER TABLE spmb_information ADD CONSTRAINT ck_spmb_information_fee CHECK(FeeAmount>=0); END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='fk_lmp_subject') THEN ALTER TABLE lmp_applications ADD CONSTRAINT fk_lmp_subject FOREIGN KEY(SubjectId) REFERENCES lmp_subjects(Id); END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='fk_content_collection') THEN ALTER TABLE school_content ADD CONSTRAINT fk_content_collection FOREIGN KEY(Collection) REFERENCES school_content_collections(Code); END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='school_content' AND INDEX_NAME='ix_content_published') THEN CREATE INDEX ix_content_published ON school_content(Status,PublishedAt,Id); END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND INDEX_NAME='ix_lmp_filter') THEN CREATE INDEX ix_lmp_filter ON lmp_applications(SubjectId,Grade,Id); END IF;
END$$
DELIMITER ;
CALL cms_normalize_constraints();
DROP PROCEDURE cms_normalize_constraints;
DROP PROCEDURE cms_normalize_v1;
DROP PROCEDURE cms_add_column;
DROP PROCEDURE cms_drop_column;
SELECT Version,AppliedAt FROM schema_migrations;
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_migration_guard;

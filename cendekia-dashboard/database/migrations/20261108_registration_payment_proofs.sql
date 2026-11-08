-- Back up cendekia_cms before running. Old registrations may have no payment proof.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_payment_proofs_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_payment_proofs_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS spmb_payment_proofs (
  ApplicationId INT NOT NULL PRIMARY KEY,
  AccountHolderName VARCHAR(150) NOT NULL,
  ContentType VARCHAR(30) NOT NULL,
  Content MEDIUMBLOB NOT NULL,
  CONSTRAINT fk_spmb_payment_application FOREIGN KEY(ApplicationId) REFERENCES spmb_applications(Id) ON DELETE CASCADE,
  CONSTRAINT ck_spmb_payment_name CHECK(CHAR_LENGTH(TRIM(AccountHolderName)) BETWEEN 1 AND 150),
  CONSTRAINT ck_spmb_payment_type CHECK(ContentType IN ('image/jpeg','image/png','application/pdf')),
  CONSTRAINT ck_spmb_payment_size CHECK(OCTET_LENGTH(Content) BETWEEN 1 AND 2097152)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lmp_payment_proofs (
  ApplicationId INT NOT NULL PRIMARY KEY,
  AccountHolderName VARCHAR(150) NOT NULL,
  ContentType VARCHAR(30) NOT NULL,
  Content MEDIUMBLOB NOT NULL,
  CONSTRAINT fk_lmp_payment_application FOREIGN KEY(ApplicationId) REFERENCES lmp_applications(Id) ON DELETE CASCADE,
  CONSTRAINT ck_lmp_payment_name CHECK(CHAR_LENGTH(TRIM(AccountHolderName)) BETWEEN 1 AND 150),
  CONSTRAINT ck_lmp_payment_type CHECK(ContentType IN ('image/jpeg','image/png','application/pdf')),
  CONSTRAINT ck_lmp_payment_size CHECK(OCTET_LENGTH(Content) BETWEEN 1 AND 2097152)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261108_registration_payment_proofs',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_payment_proofs_guard;

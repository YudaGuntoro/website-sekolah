-- Back up cendekia_cms first. Existing registrations remain valid without a PDF.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_spmb_documents_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_spmb_documents_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS spmb_application_documents (
 ApplicationId INT NOT NULL PRIMARY KEY,
 Content MEDIUMBLOB NOT NULL,
 Compression VARCHAR(10) NOT NULL,
 OriginalLength INT NOT NULL,
 CONSTRAINT fk_spmb_document_application FOREIGN KEY(ApplicationId) REFERENCES spmb_applications(Id) ON DELETE CASCADE,
 CONSTRAINT ck_spmb_document_encoding CHECK(Compression IN ('raw','br')),
 CONSTRAINT ck_spmb_document_original_size CHECK(OriginalLength BETWEEN 1 AND 1048576),
 CONSTRAINT ck_spmb_document_size CHECK(OCTET_LENGTH(Content) BETWEEN 1 AND OriginalLength),
 CONSTRAINT ck_spmb_document_raw_size CHECK(Compression <> 'raw' OR OriginalLength=OCTET_LENGTH(Content))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261109_spmb_application_documents',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_spmb_documents_guard;

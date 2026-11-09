-- Backup cendekia_cms before applying. Preserve existing requirements and separate legacy Catatan items.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_spmb_notes_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_spmb_notes_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
SET @cms_notes_ddl = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='spmb_information' AND COLUMN_NAME='DocumentNotes'), 'SELECT 1', 'ALTER TABLE spmb_information ADD COLUMN DocumentNotes VARCHAR(2000) NOT NULL DEFAULT ''''');
PREPARE cms_notes_statement FROM @cms_notes_ddl;
EXECUTE cms_notes_statement;
DEALLOCATE PREPARE cms_notes_statement;
SET SESSION group_concat_max_len=65535;
START TRANSACTION;
UPDATE spmb_information s LEFT JOIN (
 SELECT InformationId,GROUP_CONCAT(DISTINCT TRIM(REGEXP_REPLACE(Description,'^Catatan[[:space:]]*:[[:space:]]*','',1,0,'i')) ORDER BY Position SEPARATOR '\n') Notes
 FROM spmb_document_requirements WHERE REGEXP_LIKE(Description,'^Catatan[[:space:]]*:','i') GROUP BY InformationId
) n ON n.InformationId=s.Id
SET DocumentNotes=COALESCE(NULLIF(CONCAT_WS('\n',NULLIF(s.DocumentNotes,''),NULLIF(n.Notes,'')),''),'Berkas persyaratan dibawa pada saat daftar ulang.'), Version=Version+1
WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261109_spmb_document_notes')
 AND CHAR_LENGTH(CONCAT_WS('\n',NULLIF(s.DocumentNotes,''),NULLIF(n.Notes,'')))<=2000;
-- Remove a legacy item only after its complete text is present in the new note.
DELETE d FROM spmb_document_requirements d JOIN spmb_information s ON s.Id=d.InformationId
WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261109_spmb_document_notes') AND REGEXP_LIKE(d.Description,'^Catatan[[:space:]]*:','i')
 AND LOCATE(TRIM(REGEXP_REPLACE(d.Description,'^Catatan[[:space:]]*:[[:space:]]*','',1,0,'i')),s.DocumentNotes)>0;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261109_spmb_document_notes',UTC_TIMESTAMP(6));
COMMIT;
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_spmb_notes_guard;

-- Back up cendekia_cms before applying. Payment is confirmed manually by staff.
USE cendekia_cms;
CREATE TEMPORARY TABLE spmb_payment_status_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO spmb_payment_status_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
SET @spmb_payment_ddl=IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND TABLE_NAME='spmb_applications' AND COLUMN_NAME='PaymentStatus'),'SELECT 1','ALTER TABLE spmb_applications ADD COLUMN PaymentStatus VARCHAR(20) NOT NULL DEFAULT ''Belum bayar'', ADD CONSTRAINT ck_spmb_payment_status CHECK(PaymentStatus IN (''Belum bayar'',''Lunas''))');
PREPARE spmb_payment_statement FROM @spmb_payment_ddl;
EXECUTE spmb_payment_statement;
DEALLOCATE PREPARE spmb_payment_statement;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261110_spmb_payment_status',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE spmb_payment_status_guard;

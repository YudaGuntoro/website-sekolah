import assert from 'node:assert/strict';
import { mysql } from './lib/local-mysql.mjs';
function query(sql) { const r = mysql(sql); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); }
assert.equal(query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND ((TABLE_NAME IN('lmp_settings','spmb_information') AND COLUMN_NAME='ConfigJson') OR (TABLE_NAME='school_identity' AND COLUMN_NAME='MissionsJson') OR (TABLE_NAME='lmp_applications' AND COLUMN_NAME IN('Subjects','Document')));"), '0');
assert.equal(query('SELECT COUNT(*) FROM lmp_subjects;'), '3');
assert.equal(query("SELECT COUNT(*) FROM schema_migrations WHERE Version='20261106_school_normalization_v1';"), '1');
assert.equal(query("SELECT COUNT(*) FROM schema_legacy_payloads WHERE MigrationVersion='20261106_school_normalization_v1';"), '3');
assert.equal(query('SELECT COUNT(*) FROM school_missions m LEFT JOIN school_identity p ON m.IdentityId=p.Id WHERE p.Id IS NULL;'), '0');
assert.equal(query('SELECT COUNT(*) FROM spmb_document_requirements d LEFT JOIN spmb_information p ON p.Id=d.InformationId WHERE p.Id IS NULL;'), '0');
assert.equal(query('SELECT COUNT(*) FROM lmp_applications a LEFT JOIN lmp_subjects s ON a.SubjectId=s.Id WHERE s.Id IS NULL;'), '0');
for (const [sql, error] of [
  ["INSERT INTO school_missions(IdentityId,Position,Title,Text) VALUES(2147483647,1,'invalid','invalid');", /1452/],
  ["INSERT INTO school_missions(IdentityId,Position,Title,Text) SELECT IdentityId,Position,'invalid','invalid' FROM school_missions LIMIT 1;", /1062/],
  ["INSERT INTO spmb_document_requirements(InformationId,ApplicantType,Position,Description) VALUES(1,'invalid',1,'invalid');", /3819/],
  ["INSERT INTO lmp_application_documents(ApplicationId,Content) VALUES(2147483647,'invalid');", /1452/],
  ["UPDATE lmp_settings SET FeeAmount=-1 WHERE Id=1;", /3819/],
  ["UPDATE lmp_settings SET Enabled=TRUE,RegistrationStart=NULL,RegistrationEnd=NULL WHERE Id=1;", /3819/]
]) {
  // Failed statements are rolled back when this dedicated connection closes.
  const r = mysql('START TRANSACTION;\n' + sql + '\nROLLBACK;');
  assert.notEqual(r.status, 0); assert.match(r.stderr, error);
}
console.log('PASS: relational schema, preserved legacy archive, unique child positions, foreign keys, one subject per LMP application, PDF relation, fee and date constraints.');

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mysql } from './lib/local-mysql.mjs';

function query(sql) {
  const result = mysql(sql);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
assert.equal(query("SELECT COUNT(*) FROM schema_migrations WHERE Version='20261106_registration_relations_v2';"), '1');
assert.equal(query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='cendekia_cms' AND ((TABLE_NAME='spmb_applications' AND COLUMN_NAME IN ('WaveStartDate','WaveEndDate')) OR (TABLE_NAME='lmp_applications' AND COLUMN_NAME IN ('EventTitle','CompetitionDate','FeeAmount')));"), '0');
assert.equal(query('SELECT COUNT(*) FROM spmb_applications a LEFT JOIN spmb_wave_periods p ON p.AcademicYear=a.AcademicYear AND p.WaveNumber=a.WaveNumber AND p.Revision=a.WaveRevision WHERE p.Revision IS NULL;'), '0');
assert.equal(query('SELECT COUNT(*) FROM lmp_applications a LEFT JOIN lmp_events e ON e.Id=a.EventId WHERE e.Id IS NULL;'), '0');

// Every test uses a separate transaction; even expected failures roll back on disconnect.
const setup = `
INSERT IGNORE INTO academic_years(Code) VALUES('2098/2099');
INSERT INTO spmb_wave_periods(AcademicYear,WaveNumber,Revision,StartDate,EndDate) VALUES('2098/2099',1,2147483647,'2098-01-01','2098-01-02');
INSERT INTO lmp_events(Title,CompetitionDate,FeeAmount) VALUES('REL-${randomUUID()}',NULL,12345);
SET @event=LAST_INSERT_ID();
INSERT INTO spmb_applications(SubmissionKey,RegistrationNumber,AcademicYear,WaveNumber,WaveRevision,StudentName,BirthPlace,BirthDate,Gender,PreviousSchool,TargetGrade,GuardianName,GuardianPhone,Address,SubmittedAt,UpdatedAt)
VALUES('${randomUUID()}','REL-TEST','2098/2099',1,2147483647,'Relation test','Test','2090-01-01','Perempuan','Test','VII','Test','08000000000','Test',UTC_TIMESTAMP(),UTC_TIMESTAMP());
SET @application=LAST_INSERT_ID();
`;
const valid = mysql('START TRANSACTION;\n' + setup + '\nROLLBACK;');
assert.equal(valid.status, 0, valid.stderr);
for (const [sql, error] of [
  ["UPDATE spmb_applications SET WaveRevision=2147483646 WHERE Id=@application;", /1452/],
  ["UPDATE spmb_settings SET AcademicYear='2097/2098' WHERE Id=1;", /1452/],
  ["UPDATE spmb_wave_periods SET StartDate='2097-01-01' WHERE AcademicYear='2098/2099' AND WaveNumber=1 AND Revision=2147483647;", /1644/],
  ["DELETE FROM spmb_wave_periods WHERE AcademicYear='2098/2099' AND WaveNumber=1 AND Revision=2147483647;", /1451/],
  ["UPDATE lmp_events SET FeeAmount=1 WHERE Id=@event;", /1644/],
  ["INSERT INTO lmp_events(Title,CompetitionDate,FeeAmount) SELECT Title,CompetitionDate,FeeAmount FROM lmp_events WHERE Id=@event;", /1062/],
  ["INSERT INTO spmb_wave_periods(AcademicYear,WaveNumber,Revision,StartDate,EndDate) VALUES('2098/2099',1,2147483646,'2098-01-03','2098-01-01');", /3819/],
  ["INSERT INTO lmp_applications(SubmissionKey,RegistrationNumber,EventId,StudentName,PreviousSchool,Grade,SubjectId,ContactName,ContactPhone,SubmittedAt) SELECT UUID(),'REL-TEST',2147483647,'Test','Test',5,Id,'Test','08000000000',UTC_TIMESTAMP() FROM lmp_subjects LIMIT 1;", /1452/],
  ["INSERT INTO lmp_applications(SubmissionKey,RegistrationNumber,EventId,StudentName,PreviousSchool,Grade,SubjectId,ContactName,ContactPhone,SubmittedAt) SELECT UUID(),'REL-TEST',@event,'Test','Test',5,Id,'Test','08000000000',UTC_TIMESTAMP() FROM lmp_subjects LIMIT 1; DELETE FROM lmp_events WHERE Id=@event;", /1451/],
]) {
  const result = mysql('START TRANSACTION;\n' + setup + '\n' + sql + '\nROLLBACK;');
  assert.notEqual(result.status, 0, sql);
  assert.match(result.stderr, error, sql);
}
console.log('PASS: registration foreign keys, composite year/wave/revision consistency, no repeated snapshot columns, immutable history, protected deletes, and null-date event uniqueness.');

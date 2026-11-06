-- Stop the API and back up cendekia_cms before running. Requires normalization v1.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_registration_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_registration_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));

CREATE TABLE IF NOT EXISTS academic_years (
  Code VARCHAR(9) NOT NULL PRIMARY KEY,
  CONSTRAINT ck_academic_year CHECK(Code REGEXP '^20[0-9]{2}/20[0-9]{2}$' AND CAST(RIGHT(Code,4) AS UNSIGNED)=CAST(LEFT(Code,4) AS UNSIGNED)+1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS spmb_wave_periods (
  AcademicYear VARCHAR(9) NOT NULL, WaveNumber INT NOT NULL, Revision INT NOT NULL,
  StartDate DATE NOT NULL, EndDate DATE NOT NULL,
  PRIMARY KEY(AcademicYear,WaveNumber,Revision),
  UNIQUE KEY uq_spmb_period_dates(AcademicYear,WaveNumber,StartDate,EndDate),
  CONSTRAINT fk_period_year FOREIGN KEY(AcademicYear) REFERENCES academic_years(Code),
  CONSTRAINT fk_period_wave FOREIGN KEY(WaveNumber) REFERENCES spmb_waves(Number),
  CONSTRAINT ck_period_revision CHECK(Revision>0),
  CONSTRAINT ck_period_dates CHECK(EndDate>=StartDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lmp_events (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  CompetitionDate DATE NULL, FeeAmount INT NOT NULL,
  -- MySQL UNIQUE permits repeated NULLs. This generated key also deduplicates pending dates.
  CompetitionDateKey INT GENERATED ALWAYS AS (IFNULL(TO_DAYS(CompetitionDate),-1)) STORED,
  UNIQUE KEY uq_lmp_event(Title,CompetitionDateKey,FeeAmount),
  CONSTRAINT ck_event_fee CHECK(FeeAmount>=0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
DROP PROCEDURE IF EXISTS cms_registration_relations$$
CREATE PROCEDURE cms_registration_relations()
BEGIN
  IF NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261106_registration_relations_v2') THEN
    INSERT IGNORE INTO academic_years(Code) SELECT AcademicYear FROM spmb_settings;
    INSERT IGNORE INTO academic_years(Code) SELECT DISTINCT AcademicYear FROM spmb_applications;
    IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='spmb_applications' AND COLUMN_NAME='WaveRevision') THEN
      ALTER TABLE spmb_applications ADD COLUMN WaveRevision INT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND COLUMN_NAME='EventId') THEN
      ALTER TABLE lmp_applications ADD COLUMN EventId INT NULL;
    END IF;
    INSERT IGNORE INTO spmb_wave_periods(AcademicYear,WaveNumber,Revision,StartDate,EndDate)
      SELECT AcademicYear,WaveNumber,DENSE_RANK() OVER(PARTITION BY AcademicYear,WaveNumber ORDER BY WaveStartDate,WaveEndDate),WaveStartDate,WaveEndDate
      FROM (SELECT DISTINCT AcademicYear,WaveNumber,WaveStartDate,WaveEndDate FROM spmb_applications) legacy;
    UPDATE spmb_applications a JOIN spmb_wave_periods p ON p.AcademicYear=a.AcademicYear AND p.WaveNumber=a.WaveNumber AND p.StartDate=a.WaveStartDate AND p.EndDate=a.WaveEndDate
      SET a.WaveRevision=p.Revision;
    INSERT IGNORE INTO lmp_events(Title,CompetitionDate,FeeAmount)
      SELECT DISTINCT EventTitle COLLATE utf8mb4_bin,CompetitionDate,FeeAmount FROM lmp_applications;
    UPDATE lmp_applications a JOIN lmp_events e ON e.Title=a.EventTitle COLLATE utf8mb4_bin AND (e.CompetitionDate <=> a.CompetitionDate) AND e.FeeAmount=a.FeeAmount
      SET a.EventId=e.Id;
    IF EXISTS(SELECT 1 FROM spmb_applications a LEFT JOIN spmb_wave_periods p ON p.AcademicYear=a.AcademicYear AND p.WaveNumber=a.WaveNumber AND p.Revision=a.WaveRevision
      WHERE p.Revision IS NULL OR p.StartDate<>a.WaveStartDate OR p.EndDate<>a.WaveEndDate) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='SPMB historical period verification failed';
    END IF;
    IF EXISTS(SELECT 1 FROM lmp_applications a LEFT JOIN lmp_events e ON e.Id=a.EventId
      WHERE e.Id IS NULL OR BINARY e.Title<>BINARY a.EventTitle OR NOT(e.CompetitionDate <=> a.CompetitionDate) OR e.FeeAmount<>a.FeeAmount) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='LMP historical event verification failed';
    END IF;
    ALTER TABLE spmb_applications MODIFY WaveRevision INT NOT NULL;
    ALTER TABLE lmp_applications MODIFY EventId INT NOT NULL;
    IF NOT EXISTS(SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='fk_settings_year') THEN
      ALTER TABLE spmb_settings ADD CONSTRAINT fk_settings_year FOREIGN KEY(AcademicYear) REFERENCES academic_years(Code);
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='fk_spmb_period') THEN
      ALTER TABLE spmb_applications ADD CONSTRAINT fk_spmb_period FOREIGN KEY(AcademicYear,WaveNumber,WaveRevision) REFERENCES spmb_wave_periods(AcademicYear,WaveNumber,Revision);
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_NAME='fk_lmp_event') THEN
      ALTER TABLE lmp_applications ADD CONSTRAINT fk_lmp_event FOREIGN KEY(EventId) REFERENCES lmp_events(Id);
    END IF;
    INSERT INTO schema_migrations(Version,AppliedAt) VALUES('20261106_registration_relations_v2',UTC_TIMESTAMP(6));
  END IF;
  -- Cleanup can resume if interrupted after backfill was verified and recorded.
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='spmb_applications' AND COLUMN_NAME='WaveStartDate') THEN ALTER TABLE spmb_applications DROP COLUMN WaveStartDate; END IF;
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='spmb_applications' AND COLUMN_NAME='WaveEndDate') THEN ALTER TABLE spmb_applications DROP COLUMN WaveEndDate; END IF;
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND COLUMN_NAME='EventTitle') THEN ALTER TABLE lmp_applications DROP COLUMN EventTitle; END IF;
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND COLUMN_NAME='CompetitionDate') THEN ALTER TABLE lmp_applications DROP COLUMN CompetitionDate; END IF;
  IF EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lmp_applications' AND COLUMN_NAME='FeeAmount') THEN ALTER TABLE lmp_applications DROP COLUMN FeeAmount; END IF;
END$$
DELIMITER ;
CALL cms_registration_relations();
DROP PROCEDURE cms_registration_relations;

-- Published historical facts are immutable. New facts require a new row/revision.
DELIMITER $$
DROP TRIGGER IF EXISTS spmb_period_immutable$$
CREATE TRIGGER spmb_period_immutable BEFORE UPDATE ON spmb_wave_periods FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Historical SPMB periods are immutable'; END$$
DROP TRIGGER IF EXISTS lmp_event_immutable$$
CREATE TRIGGER lmp_event_immutable BEFORE UPDATE ON lmp_events FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Historical LMP events are immutable'; END$$
DELIMITER ;
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_registration_guard;

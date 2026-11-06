USE cendekia_cms;

CREATE TABLE IF NOT EXISTS spmb_settings (
  Id INT NOT NULL PRIMARY KEY,
  AcademicYear VARCHAR(9) NOT NULL,
  Enabled BOOLEAN NOT NULL DEFAULT FALSE,
  Version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
INSERT IGNORE INTO spmb_settings (Id, AcademicYear, Enabled) VALUES (1, '2027/2028', FALSE);

CREATE TABLE IF NOT EXISTS spmb_waves (
  Number INT NOT NULL PRIMARY KEY,
  StartDate DATE NULL,
  EndDate DATE NULL,
  Enabled BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT ck_spmb_wave_number CHECK (Number BETWEEN 1 AND 4),
  CONSTRAINT ck_spmb_wave_dates CHECK ((StartDate IS NULL AND EndDate IS NULL AND Enabled=FALSE) OR (StartDate IS NOT NULL AND EndDate IS NOT NULL AND EndDate >= StartDate))
) ENGINE=InnoDB;
INSERT IGNORE INTO spmb_waves (Number) VALUES (1), (2), (3), (4);

CREATE TABLE IF NOT EXISTS spmb_applications (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  SubmissionKey CHAR(36) NOT NULL,
  RegistrationNumber VARCHAR(32) NOT NULL,
  AcademicYear VARCHAR(9) NOT NULL,
  WaveNumber INT NOT NULL,
  WaveStartDate DATE NOT NULL,
  WaveEndDate DATE NOT NULL,
  StudentName VARCHAR(150) NOT NULL,
  Nisn VARCHAR(10) NULL,
  BirthPlace VARCHAR(100) NOT NULL,
  BirthDate DATE NOT NULL,
  Gender VARCHAR(20) NOT NULL,
  PreviousSchool VARCHAR(150) NOT NULL,
  TargetGrade VARCHAR(4) NOT NULL,
  GuardianName VARCHAR(150) NOT NULL,
  GuardianPhone VARCHAR(25) NOT NULL,
  GuardianEmail VARCHAR(254) NULL,
  Address VARCHAR(1000) NOT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Baru',
  SubmittedAt DATETIME(6) NOT NULL,
  UpdatedAt DATETIME(6) NOT NULL,
  Version INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_spmb_submission (SubmissionKey),
  UNIQUE KEY uq_spmb_nisn_year (AcademicYear, Nisn),
  INDEX ix_spmb_year_wave (AcademicYear, WaveNumber),
  CONSTRAINT fk_spmb_wave FOREIGN KEY (WaveNumber) REFERENCES spmb_waves(Number),
  CONSTRAINT ck_spmb_application_status CHECK (Status IN ('Baru', 'Diproses', 'Diterima', 'Ditolak'))
) ENGINE=InnoDB;
ALTER TABLE spmb_applications MODIFY TargetGrade VARCHAR(4) NOT NULL;

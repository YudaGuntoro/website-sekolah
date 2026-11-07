USE cendekia_cms;
CREATE TEMPORARY TABLE cms_wave_groups_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_wave_groups_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));

-- One editable invitation per academic year and wave, independent of schedule revisions.
CREATE TABLE IF NOT EXISTS spmb_wave_groups (
  AcademicYear VARCHAR(9) NOT NULL,
  WaveNumber INT NOT NULL,
  WhatsappGroupUrl VARCHAR(300) NOT NULL DEFAULT '',
  PRIMARY KEY(AcademicYear, WaveNumber),
  CONSTRAINT fk_spmb_group_year FOREIGN KEY(AcademicYear) REFERENCES academic_years(Code),
  CONSTRAINT fk_spmb_group_wave FOREIGN KEY(WaveNumber) REFERENCES spmb_waves(Number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations(Version, AppliedAt) VALUES('20261107_spmb_wave_groups', UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_wave_groups_guard;

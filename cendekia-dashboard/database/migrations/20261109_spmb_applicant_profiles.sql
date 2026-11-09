USE cendekia_cms;
CREATE TEMPORARY TABLE cms_spmb_profile_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_spmb_profile_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS spmb_applicant_profiles (
 ApplicationId INT NOT NULL PRIMARY KEY,
 Nickname VARCHAR(100) NOT NULL,
 Religion VARCHAR(20) NOT NULL,
 MedicalHistory VARCHAR(1000) NOT NULL DEFAULT '',
 HeightCm DECIMAL(5,1) NOT NULL,
 WeightKg DECIMAL(5,1) NOT NULL,
 BloodGroup VARCHAR(2) NOT NULL,
 ParentPhone VARCHAR(25) NOT NULL,
 FatherName VARCHAR(150) NOT NULL,
 MotherName VARCHAR(150) NOT NULL,
 FatherOccupation VARCHAR(150) NOT NULL,
 MotherOccupation VARCHAR(150) NOT NULL,
 GuardianOccupation VARCHAR(150) NOT NULL,
 ParentAddress VARCHAR(1000) NOT NULL,
 EconomicCondition VARCHAR(20) NOT NULL,
 DailyLanguage VARCHAR(100) NOT NULL DEFAULT '',
 CONSTRAINT fk_spmb_profile_application FOREIGN KEY(ApplicationId) REFERENCES spmb_applications(Id) ON DELETE CASCADE,
 CONSTRAINT ck_spmb_profile_religion CHECK(Religion='Islam'),
 CONSTRAINT ck_spmb_profile_height CHECK(HeightCm BETWEEN 20 AND 300),
 CONSTRAINT ck_spmb_profile_weight CHECK(WeightKg BETWEEN 1 AND 500),
 CONSTRAINT ck_spmb_profile_blood CHECK(BloodGroup IN('A','B','AB','O')),
 CONSTRAINT ck_spmb_profile_economy CHECK(EconomicCondition IN('Baik','Kurang Baik','Sangat Baik','Tidak Stabil'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261109_spmb_applicant_profiles',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_spmb_profile_guard;

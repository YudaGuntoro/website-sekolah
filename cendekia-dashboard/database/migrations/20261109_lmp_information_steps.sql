-- Back up cendekia_cms before applying. Seeds the current public LMP flow once.
USE cendekia_cms;
CREATE TEMPORARY TABLE cms_lmp_steps_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO cms_lmp_steps_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS lmp_information_steps (
 Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 SettingsId INT NOT NULL,
 Position INT NOT NULL,
 Title VARCHAR(150) NOT NULL,
 Description VARCHAR(3000) NOT NULL,
 Icon VARCHAR(20) NOT NULL,
 ShowPayment BOOLEAN NOT NULL DEFAULT FALSE,
 UNIQUE KEY uq_lmp_step_position(SettingsId,Position),
 CONSTRAINT fk_lmp_step_settings FOREIGN KEY(SettingsId) REFERENCES lmp_settings(Id) ON DELETE CASCADE,
 CONSTRAINT ck_lmp_step_position CHECK(Position BETWEEN 1 AND 20),
 CONSTRAINT ck_lmp_step_title CHECK(CHAR_LENGTH(TRIM(Title)) BETWEEN 1 AND 150),
 CONSTRAINT ck_lmp_step_icon CHECK(Icon IN('register','folder','payment','test','check','book'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
START TRANSACTION;
INSERT INTO lmp_information_steps(SettingsId,Position,Title,Description,Icon,ShowPayment)
SELECT s.Id, n.Position+1,
 CASE n.Position WHEN 0 THEN 'Isi data peserta' WHEN 1 THEN 'Unggah berkas PDF' WHEN 2 THEN 'Bayar biaya pendaftaran' WHEN 3 THEN 'Pilih mata pelajaran' ELSE 'Pengumuman juara & gebyar' END,
 CASE n.Position WHEN 0 THEN 'Daftarkan nama lengkap, asal sekolah, dan kelas 5 atau 6 SD melalui formulir online.' WHEN 1 THEN s.DocumentInstructions WHEN 2 THEN s.PaymentDetails WHEN 3 THEN 'Pilih satu mata pelajaran: Matematika, Bahasa Indonesia, atau Bahasa Inggris.' ELSE CONCAT(COALESCE(DATE_FORMAT(s.AnnouncementDate,'%d/%m/%Y'),'Menyusul'),'. ',s.AnnouncementDetails) END,
 CASE n.Position WHEN 0 THEN 'register' WHEN 1 THEN 'folder' WHEN 2 THEN 'payment' WHEN 3 THEN 'book' ELSE 'check' END,
 n.Position=2
FROM lmp_settings s CROSS JOIN (SELECT 0 Position UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) n
WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261109_lmp_information_steps');
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261109_lmp_information_steps',UTC_TIMESTAMP(6));
COMMIT;
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE cms_lmp_steps_guard;

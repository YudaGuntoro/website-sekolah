-- Backup before applying. Seed current website values once; repeat runs preserve edits.
USE cendekia_cms;
CREATE TEMPORARY TABLE school_highlights_guard (Acquired INT NOT NULL CHECK(Acquired=1));
INSERT INTO school_highlights_guard VALUES(GET_LOCK('cendekia_school_schema_migration',30));
CREATE TABLE IF NOT EXISTS school_highlights (
  Id INT NOT NULL PRIMARY KEY,
  Heading VARCHAR(150) NOT NULL,
  Accent VARCHAR(150) NOT NULL DEFAULT '',
  Description VARCHAR(1000) NOT NULL DEFAULT '',
  Enabled BOOLEAN NOT NULL DEFAULT TRUE,
  Version INT NOT NULL DEFAULT 1,
  CONSTRAINT ck_school_highlights_singleton CHECK(Id=1),
  CONSTRAINT ck_school_highlights_enabled CHECK(Enabled IN(0,1)),
  CONSTRAINT ck_school_highlights_version CHECK(Version>=1)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS school_highlight_cards (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  HighlightsId INT NOT NULL,
  Position INT NOT NULL,
  Title VARCHAR(100) NOT NULL,
  Category VARCHAR(100) NOT NULL DEFAULT '',
  Text VARCHAR(500) NOT NULL DEFAULT '',
  Value VARCHAR(7) NOT NULL,
  Icon VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_school_highlight_position(HighlightsId,Position),
  CONSTRAINT fk_school_highlight_root FOREIGN KEY(HighlightsId) REFERENCES school_highlights(Id) ON DELETE CASCADE,
  CONSTRAINT ck_school_highlight_position CHECK(Position BETWEEN 1 AND 12),
  CONSTRAINT ck_school_highlight_value CHECK(Value REGEXP '^(0|[1-9][0-9]{0,5})[+]?$'),
  CONSTRAINT ck_school_highlight_icon CHECK(Icon IN('classroom','educators','activities','laboratory','library','growth'))
) ENGINE=InnoDB;
INSERT IGNORE INTO school_highlights(Id,Heading,Accent,Description)
VALUES(1,'Ruang untuk','tumbuh lebih jauh.','Dukungan akademik, fasilitas, dan aktivitas yang membuka lebih banyak cara untuk belajar dan berkembang.');
INSERT IGNORE INTO school_highlight_cards(HighlightsId,Position,Title,Category,Text,Value,Icon)
SELECT 1, seed.Position, seed.Title, seed.Category, seed.Text, seed.Value, seed.Icon FROM (
  SELECT 1 Position, 'Ruang Kelas' Title, 'Fasilitas belajar' Category, 'Ruang belajar nyaman yang mendukung diskusi dan kolaborasi.' Text, '18+' Value, 'classroom' Icon
  UNION ALL SELECT 2,'Tenaga Pendidik','Komunitas akademik','Guru dan staf yang mendampingi proses belajar murid.','30+','educators'
  UNION ALL SELECT 3,'Ekstrakurikuler','Eksplorasi minat','Pilihan kegiatan untuk mengeksplorasi minat dan bakat.','12+','activities'
  UNION ALL SELECT 4,'Laboratorium','Praktik & riset','Ruang praktik untuk belajar sains, komputer, dan keterampilan.','3','laboratory'
  UNION ALL SELECT 5,'Perpustakaan','Literasi','Koleksi bacaan dan ruang tenang untuk mencari inspirasi.','1','library'
  UNION ALL SELECT 6,'Fokus Pengembangan','Pembelajaran holistik','Akademik, karakter, kreativitas, dan kebugaran.','4','growth'
) seed WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE Version='20261110_school_highlights');
INSERT IGNORE INTO schema_migrations(Version,AppliedAt) VALUES('20261110_school_highlights',UTC_TIMESTAMP(6));
DO RELEASE_LOCK('cendekia_school_schema_migration');
DROP TEMPORARY TABLE school_highlights_guard;

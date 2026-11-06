USE cendekia_cms;
CREATE TABLE IF NOT EXISTS school_identity (
  Id INT NOT NULL PRIMARY KEY,
  Vision VARCHAR(4000) NOT NULL DEFAULT '',
  Motto VARCHAR(500) NOT NULL DEFAULT '',
  MissionsJson LONGTEXT NOT NULL,
  Version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
-- Keep administrator edits when setup runs again.
INSERT IGNORE INTO school_identity (Id, Vision, Motto, MissionsJson)
VALUES (1, 'Mewujudkan sekolah yang unggul dalam iman, ilmu, dan amal melalui kepemimpinan yang inklusif, berintegritas, dan berorientasi pada pembinaan karakter, prestasi, serta kepedulian lingkungan.', 'Berkarakter, berprestasi, menginspirasi.', '[{"title":"Iman & akhlak","text":"Membina keimanan dan akhlak mulia melalui kegiatan keagamaan untuk membentuk siswa yang religius dan berakhlak."},{"title":"Ilmu & literasi","text":"Meningkatkan kualitas pembelajaran dan budaya literasi untuk membentuk generasi cerdas dan berwawasan."},{"title":"Jiwa pemimpin","text":"Menumbuhkan jiwa kepemimpinan siswa."},{"title":"Budaya positif","text":"Membangun budaya sekolah positif melalui komunikasi terbuka, kolaborasi harmonis, serta lingkungan belajar yang menyenangkan dan aman."},{"title":"Peduli lingkungan","text":"Menanamkan kepedulian terhadap lingkungan."},{"title":"Bakat & minat","text":"Mendukung bakat dan minat melalui kegiatan ekstrakurikuler yang membangun fisik sehat, jiwa sportif, dan kerja sama tim."}]');

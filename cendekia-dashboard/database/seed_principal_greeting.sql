USE cendekia_cms;
-- Preserve existing greetings, including drafts, on repeated initialization.
INSERT INTO school_content (Collection, Title, Slug, Category, Summary, Body, ImageUrl, Status, PublishedAt, SortOrder)
SELECT 'sambutan', 'Nama Kepala Sekolah', 'sambutan-kepala-sekolah', 'Kepala Sekolah SMPIT Cendekia', '',
'Assalamu’alaikum warahmatullahi wabarakatuh.

Selamat datang di website resmi SMPIT Cendekia Purwakarta. Semoga website ini menjadi jendela informasi dan komunikasi bagi siswa, orang tua, alumni, serta seluruh masyarakat.

Kami berkomitmen mendampingi setiap anak agar tumbuh dalam ilmu, akhlak, dan kepedulian. Mari berkolaborasi menciptakan pengalaman belajar yang bermakna dan mempersiapkan generasi yang bermanfaat.

Kami mengajak seluruh keluarga besar SMPIT Cendekia untuk terus menjaga semangat belajar, menghargai perbedaan, dan mendukung potensi setiap peserta didik. Terima kasih telah menjadi bagian dari perjalanan pendidikan ini.',
'/images/mentor/girl1.svg', 'Published', UTC_TIMESTAMP(), 0
WHERE NOT EXISTS (SELECT 1 FROM school_content WHERE Collection = 'sambutan');

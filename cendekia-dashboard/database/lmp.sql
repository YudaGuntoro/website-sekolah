USE cendekia_cms;
CREATE TABLE IF NOT EXISTS lmp_settings (
  Id INT NOT NULL PRIMARY KEY,
  ConfigJson LONGTEXT NOT NULL,
  Version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
INSERT IGNORE INTO lmp_settings (Id, ConfigJson) VALUES (1, '{
  "title": "Lomba Mata Pelajaran",
  "introduction": "Lomba mata pelajaran untuk siswa kelas 5 dan 6 SD di SMPIT Cendekia Purwakarta.",
  "enabled": false,
  "registrationStart": null,
  "registrationEnd": null,
  "competitionDate": "2027-01-21",
  "competitionTime": "07.30–16.00 WIB",
  "venue": "SMPIT Cendekia Purwakarta",
  "announcementDate": "2027-01-28",
  "announcementDetails": "Jam dan tempat gebyar menyusul.",
  "feeAmount": 35000,
  "paymentDetails": "Informasi rekening pembayaran menyusul. Hubungi panitia sebelum melakukan pembayaran.",
  "documentInstructions": "Persyaratan berkas pendaftaran menyusul.",
  "documentRequired": false,
  "testDetails": "Tes tulis berupa pilihan ganda (PG), dilaksanakan langsung di sekolah menggunakan ExamBro. Peserta dengan skor tinggi akan mengikuti tes lanjutan berupa wawancara.",
  "benefits": "Snack; sertifikat bagi juara 1 dan 2; piala untuk juara umum.",
  "afterSubmit": "Simpan nomor pendaftaran. Panitia akan menghubungi melalui WhatsApp untuk konfirmasi berkas, pembayaran, dan petunjuk pelaksanaan lomba.",
  "whatsappGroupUrl": ""
}
');

CREATE TABLE IF NOT EXISTS lmp_applications (
  Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  SubmissionKey CHAR(36) NOT NULL,
  RegistrationNumber VARCHAR(40) NOT NULL,
  EventTitle VARCHAR(150) NOT NULL,
  CompetitionDate DATE NULL,
  StudentName VARCHAR(150) NOT NULL,
  PreviousSchool VARCHAR(150) NOT NULL,
  Grade INT NOT NULL,
  Subjects VARCHAR(100) NOT NULL,
  ContactName VARCHAR(150) NOT NULL,
  ContactPhone VARCHAR(20) NOT NULL,
  FeeAmount INT NOT NULL,
  Document MEDIUMBLOB NULL,
  Status VARCHAR(30) NOT NULL DEFAULT 'Baru',
  PaymentStatus VARCHAR(20) NOT NULL DEFAULT 'Belum bayar',
  SubmittedAt DATETIME(6) NOT NULL,
  Version INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_lmp_submission (SubmissionKey),
  CONSTRAINT ck_lmp_grade CHECK (Grade IN (5,6)),
  CONSTRAINT ck_lmp_subject CHECK (Subjects IN ('Matematika','Bahasa Indonesia','Bahasa Inggris')),
  CONSTRAINT ck_lmp_status CHECK (Status IN ('Baru','Diproses','Terverifikasi','Dibatalkan')),
  CONSTRAINT ck_lmp_payment CHECK (PaymentStatus IN ('Belum bayar','Lunas'))
) ENGINE=InnoDB;

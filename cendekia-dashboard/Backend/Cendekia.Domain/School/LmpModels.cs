using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class LmpSettings
{
    public int Id { get; set; } = 1;
    public LmpConfig Config { get; set; } = new();
    public int Version { get; set; } = 1;
}

public class LmpConfig
{
    [Required, MaxLength(150)] public string Title { get; set; } = "Lomba Mata Pelajaran";
    [Required, MaxLength(1000)] public string Introduction { get; set; } = "Lomba mata pelajaran untuk siswa kelas 5 dan 6 SD di SMPIT Cendekia Purwakarta.";
    public bool Enabled { get; set; }
    public DateOnly? RegistrationStart { get; set; }
    public DateOnly? RegistrationEnd { get; set; }
    public DateOnly? CompetitionDate { get; set; } = new(2027, 1, 21);
    [MaxLength(100)] public string CompetitionTime { get; set; } = "07.30–16.00 WIB";
    [MaxLength(300)] public string Venue { get; set; } = "SMPIT Cendekia Purwakarta";
    public DateOnly? AnnouncementDate { get; set; } = new(2027, 1, 28);
    [MaxLength(300)] public string AnnouncementDetails { get; set; } = "Jam dan tempat gebyar menyusul.";
    [Range(0, 100000000)] public int FeeAmount { get; set; } = 35000;
    [MaxLength(1000)] public string PaymentDetails { get; set; } = "Informasi rekening pembayaran menyusul. Hubungi panitia sebelum melakukan pembayaran.";
    [MaxLength(1000)] public string DocumentInstructions { get; set; } = "Persyaratan berkas pendaftaran menyusul.";
    public bool DocumentRequired { get; set; }
    [Required, MaxLength(1500)] public string TestDetails { get; set; } = "Tes tulis berupa pilihan ganda (PG), dilaksanakan langsung di sekolah menggunakan ExamBro. Peserta dengan skor tinggi akan mengikuti tes lanjutan berupa wawancara.";
    [MaxLength(1000)] public string Benefits { get; set; } = "Snack; sertifikat bagi juara 1 dan 2; piala untuk juara umum.";
    [Required, MaxLength(1500)] public string AfterSubmit { get; set; } = "Simpan nomor pendaftaran. Panitia akan menghubungi melalui WhatsApp untuk konfirmasi berkas, pembayaran, dan petunjuk pelaksanaan lomba.";
    [MaxLength(300)] public string WhatsappGroupUrl { get; set; } = "";
}
public class LmpSettingsRequest
{
    [Required] public LmpConfig Config { get; set; } = new();
    public int Version { get; set; }
}
public class LmpApplication
{
    public int Id { get; set; }
    public Guid SubmissionKey { get; set; }
    [MaxLength(40)] public string RegistrationNumber { get; set; } = "";
    public int EventId { get; set; }
    public LmpEvent Event { get; set; } = null!;
    [MaxLength(150)] public string StudentName { get; set; } = "";
    [MaxLength(150)] public string PreviousSchool { get; set; } = "";
    public int Grade { get; set; }
    public int SubjectId { get; set; }
    public LmpSubject Subject { get; set; } = null!;
    [MaxLength(150)] public string ContactName { get; set; } = "";
    [MaxLength(20)] public string ContactPhone { get; set; } = "";
    public LmpDocument? Attachment { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "Baru";
    [MaxLength(20)] public string PaymentStatus { get; set; } = "Belum bayar";
    public DateTime SubmittedAt { get; set; }
    public int Version { get; set; } = 1;
}
public class LmpEvent
{
    public int Id { get; set; }
    [MaxLength(150)] public string Title { get; set; } = "";
    public DateOnly? CompetitionDate { get; set; }
    public int FeeAmount { get; set; }
}
public class LmpSubject
{
    public int Id { get; set; }
    [MaxLength(30)] public string Code { get; set; } = "";
    [MaxLength(100)] public string Name { get; set; } = "";
}
public class LmpDocument
{
    public int ApplicationId { get; set; }
    public byte[] Content { get; set; } = [];
}
public class LmpSubmissionRequest
{
    public Guid SubmissionKey { get; set; }
    public int SettingsVersion { get; set; }
    [Required, MaxLength(150)] public string StudentName { get; set; } = "";
    [Required, MaxLength(150)] public string PreviousSchool { get; set; } = "";
    [Range(5, 6)] public int Grade { get; set; }
    [Required, MinLength(1), MaxLength(3)] public List<string> Subjects { get; set; } = [];
    [Required, MaxLength(150)] public string ContactName { get; set; } = "";
    [Required, RegularExpression("^\\+?[0-9]{8,15}$")] public string ContactPhone { get; set; } = "";
    public bool Consent { get; set; }
}
public class LmpStatusRequest
{
    [Required, RegularExpression("^(Baru|Diproses|Terverifikasi|Dibatalkan)$")] public string Status { get; set; } = "Baru";
    [Required, RegularExpression("^(Belum bayar|Lunas)$")] public string PaymentStatus { get; set; } = "Belum bayar";
    public int Version { get; set; }
}

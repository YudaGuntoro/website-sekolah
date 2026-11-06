using DentalCare.Application.Abstractions;
using DentalCare.Domain.School;

namespace DentalCare.Application.Services;

public record PdfUpload(string FileName, byte[] Content);
public record FileDownload(string FileName, byte[] Content);
public class LmpService(ILmpRepository repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    private static readonly string[] Subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
    private static DateOnly Today() => DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);
    private static bool Open(LmpConfig c) => c.Enabled && c.RegistrationStart.HasValue && c.RegistrationEnd.HasValue && Today() >= c.RegistrationStart && Today() <= c.RegistrationEnd;
    private static object View(LmpSettings row) => new { config = row.Config, row.Version, isOpen = Open(row.Config), today = Today() };
    public async Task<ServiceResult> Settings() => ApiOk(View(await repository.GetSettingsAsync()));
    public async Task<ServiceResult> Save(LmpSettingsRequest request)
    {
        var c = request.Config;
        if (c.RegistrationStart.HasValue != c.RegistrationEnd.HasValue || c.RegistrationStart > c.RegistrationEnd || (c.Enabled && !c.RegistrationStart.HasValue)) return ApiBadRequest("Lengkapi tanggal mulai dan selesai pendaftaran secara berurutan sebelum dibuka.");
        if (c.CompetitionDate.HasValue && c.RegistrationEnd > c.CompetitionDate) return ApiBadRequest("Pendaftaran tidak boleh berakhir setelah tanggal lomba.");
        if (c.CompetitionDate.HasValue && c.AnnouncementDate < c.CompetitionDate) return ApiBadRequest("Pengumuman tidak boleh sebelum tanggal lomba.");
        var group = c.WhatsappGroupUrl?.Trim() ?? "";
        if (group.Length > 0 && !(Uri.TryCreate(group, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.Host == "chat.whatsapp.com" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo) && uri.AbsolutePath.Length > 1)) return ApiBadRequest("Gunakan tautan undangan grup https://chat.whatsapp.com/...");
        c.WhatsappGroupUrl = group;
        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var row = await repository.GetSettingsAsync(forUpdate: true);
        if (row.Version != request.Version) return Conflict("Pengaturan berubah. Muat ulang sebelum menyimpan.");
        row.Config = c; row.Version++;
        await unitOfWork.SaveChangesAsync(); await transaction.CommitAsync();
        return ApiOk(View(row), "Informasi LMP disimpan.");
    }
    public async Task<ServiceResult> Submit(LmpSubmissionRequest request, PdfUpload? document)
    {
        if (request.SubmissionKey == Guid.Empty || !request.Consent) return ApiBadRequest("Identitas pengiriman dan persetujuan wajib diisi.");
        if (request.Subjects.Count != 1 || request.Subjects.Any(s => !Subjects.Contains(s))) return ApiBadRequest("Pilih satu mata pelajaran.");
        byte[]? pdf = document?.Content;
        if (document is not null) {
            if (pdf!.Length == 0 || pdf.Length > 2 * 1024 * 1024 || !Path.GetExtension(document.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase)) return ApiBadRequest("Berkas harus berupa PDF, maksimal 2 MB.");
            if (pdf.Length < 8 || !pdf.AsSpan(0, 5).SequenceEqual("%PDF-"u8)) return ApiBadRequest("Isi berkas bukan PDF yang valid.");
        }
        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true); var c = settings.Config;
        var prior = await repository.Applications.FirstAsync(x => x.SubmissionKey == request.SubmissionKey);
        if (prior is not null) return Receipt(prior, c);
        if (settings.Version != request.SettingsVersion) return Conflict("Informasi lomba diperbarui. Periksa kembali informasi terbaru lalu kirim ulang.");
        if (!Open(c)) return Conflict("Pendaftaran LMP sedang ditutup. Silakan periksa jadwal atau hubungi panitia.");
        if (c.DocumentRequired && pdf is null) return ApiBadRequest("Berkas PDF pendaftaran wajib diunggah.");
        var subject = await repository.GetSubjectAsync(request.Subjects[0]);
        if (subject is null) return ApiBadRequest("Mata pelajaran tidak tersedia.");
        var entry = new LmpApplication {
            SubmissionKey = request.SubmissionKey, EventTitle = c.Title, CompetitionDate = c.CompetitionDate,
            StudentName = request.StudentName.Trim(), PreviousSchool = request.PreviousSchool.Trim(), Grade = request.Grade,
            SubjectId = subject.Id, ContactName = request.ContactName.Trim(), ContactPhone = request.ContactPhone,
            FeeAmount = c.FeeAmount, Attachment = pdf is null ? null : new LmpDocument { Content = pdf }, SubmittedAt = DateTime.UtcNow
        };
        repository.Applications.Add(entry); await unitOfWork.SaveChangesAsync();
        entry.RegistrationNumber = $"LMP-{(entry.CompetitionDate?.Year ?? Today().Year)}-{entry.Id:D6}";
        await unitOfWork.SaveChangesAsync(); await transaction.CommitAsync();
        return Receipt(entry, c);
    }
    private static ServiceResult Receipt(LmpApplication entry, LmpConfig config) => ApiOk(new { entry.RegistrationNumber, entry.EventTitle, entry.CompetitionDate, entry.FeeAmount, config.AfterSubmit, config.WhatsappGroupUrl }, "Pendaftaran berhasil diterima.");
    public async Task<ServiceResult> List(string? search, string? subject, int? grade, string? status, string? payment, int page = 1, int limit = 10)
    {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        System.Linq.Expressions.Expression<Func<LmpApplication, bool>> filter = x =>
            (string.IsNullOrWhiteSpace(search) || x.StudentName.Contains(search) || x.PreviousSchool.Contains(search) || x.RegistrationNumber.Contains(search)) &&
            (string.IsNullOrEmpty(subject) || x.Subject.Name == subject) && (!grade.HasValue || x.Grade == grade) &&
            (string.IsNullOrEmpty(status) || x.Status == status) && (string.IsNullOrEmpty(payment) || x.PaymentStatus == payment);
        var total = await repository.Applications.CountAsync(filter);
        var items = await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.StudentName, x.PreviousSchool, x.Grade, subjects = x.Subject.Name, x.Status, x.PaymentStatus, x.SubmittedAt }, filter, x => x.Id, descending: true, skip: (page-1)*limit, take: limit);
        return ApiOk(new { items, total });
    }
    public async Task<ServiceResult> Detail(int id)
    {
        var x = await repository.Applications.FirstAsync(x => x.Id == id);
        return x is null ? ApiNotFound() : ApiOk(new { x.Id, x.RegistrationNumber, x.EventTitle, x.CompetitionDate, x.StudentName, x.PreviousSchool, x.Grade, subjects = x.Subject.Name, x.ContactName, x.ContactPhone, x.FeeAmount, hasDocument = await repository.HasDocumentAsync(id), x.Status, x.PaymentStatus, x.SubmittedAt, x.Version });
    }
    public async Task<ServiceResult> Document(int id)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id);
        if (entry is null) return ApiNotFound();
        var bytes = await repository.GetDocumentAsync(id);
        return bytes is null ? ApiNotFound() : ApiOk(new FileDownload($"{entry.RegistrationNumber}.pdf", bytes));
    }
    public async Task<ServiceResult> Status(int id, LmpStatusRequest request)
    {
        var row = await repository.Applications.FirstAsync(x => x.Id == id, tracking: true);
        if (row is null) return ApiNotFound();
        if (row.Version != request.Version) return Conflict("Data berubah. Buka ulang detail peserta.");
        row.Status = request.Status; row.PaymentStatus = request.PaymentStatus; row.Version++;
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Data berubah. Buka ulang detail peserta."); }
        return ApiOk(new { row.Status, row.PaymentStatus, row.Version });
    }
}

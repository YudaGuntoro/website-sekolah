using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Services;

public record PdfUpload(string FileName, byte[] Content);
public record FileDownload(string FileName, byte[] Content);
public class LmpService(ILmpRepository repository, IApplicationUnitOfWork unitOfWork, IRegistrationFileOptimizer fileOptimizer) : ApplicationService
{
    private static readonly string[] Subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
    private static DateOnly Today() => DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);
    private static bool Open(LmpConfig c) => c.Enabled && c.RegistrationStart.HasValue && c.RegistrationEnd.HasValue && Today() >= c.RegistrationStart && Today() <= c.RegistrationEnd;
    private static object View(LmpSettings row)
    {
        row.Config.Steps = row.StepRecords.OrderBy(s => s.Position).Select(s => new LmpInformationStep { Title = s.Title, Description = s.Description, Icon = s.Icon, ShowPayment = s.ShowPayment }).ToList();
        return new { config = row.Config, row.Version, isOpen = Open(row.Config), today = Today() };
    }
    public async Task<ServiceResult> Settings() => ApiOk(View(await repository.GetSettingsAsync()));
    public async Task<ServiceResult> Save(LmpSettingsRequest request)
    {
        var c = request.Config;
        if (c.Steps is null || c.Steps.Count is < 1 or > 20 || c.Steps.Any(s => s is null || string.IsNullOrWhiteSpace(s.Title)) || c.Steps.Count(s => s.ShowPayment) > 1)
            return ApiBadRequest("Isi 1 sampai 20 tahap dengan judul; rincian biaya hanya boleh tampil pada satu tahap.");
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
        row.StepRecords.Sort((a, b) => a.Position.CompareTo(b.Position));
        OrderedChildren.Replace(row.StepRecords, c.Steps, () => new LmpInformationStepRecord { SettingsId = row.Id },
            (record, step, position) => { record.Position = position; record.Title = step.Title.Trim(); record.Description = step.Description?.Trim() ?? ""; record.Icon = step.Icon; record.ShowPayment = step.ShowPayment; });
        await unitOfWork.SaveChangesAsync(); await transaction.CommitAsync();
        return ApiOk(View(row), "Informasi LMP disimpan.");
    }
    public async Task<ServiceResult> Submit(LmpSubmissionRequest request, PdfUpload? document, PaymentProofUpload? paymentProof, CancellationToken cancellationToken = default)
    {
        var proofType = PaymentProofFiles.ContentType(paymentProof);
        if (proofType is null) return ApiBadRequest("Bukti transfer wajib berupa JPG, PNG, atau PDF yang valid, maksimal 1 MB.");
        if (string.IsNullOrWhiteSpace(request.TransferAccountName)) return ApiBadRequest("Nama pemilik rekening pengirim wajib diisi.");
        if (request.SubmissionKey == Guid.Empty || !request.Consent) return ApiBadRequest("Identitas pengiriman dan persetujuan wajib diisi.");
        if (request.Subjects.Count != 1 || request.Subjects.Any(s => !Subjects.Contains(s))) return ApiBadRequest("Pilih satu mata pelajaran.");
        byte[]? pdf = document?.Content;
        if (document is not null) {
            if (pdf!.Length == 0 || pdf.Length > 2 * 1024 * 1024 || !Path.GetExtension(document.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase)) return ApiBadRequest("Berkas harus berupa PDF, maksimal 2 MB.");
            if (pdf.Length < 8 || !pdf.AsSpan(0, 5).SequenceEqual("%PDF-"u8)) return ApiBadRequest("Isi berkas bukan PDF yang valid.");
        }
        var optimizedProof = await fileOptimizer.OptimizeAsync(new PaymentProofFile(proofType, paymentProof!.Content), cancellationToken);
        if (optimizedProof is null) return ApiBadRequest("Bukti transfer gambar tidak dapat dibaca atau resolusinya terlalu besar. Unggah JPG/PNG yang valid dengan resolusi lebih kecil.");
        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true); var c = settings.Config;
        var prior = await repository.Applications.FirstAsync(x => x.SubmissionKey == request.SubmissionKey);
        if (prior is not null) return await Receipt(prior, c);
        if (settings.Version != request.SettingsVersion) return Conflict("Informasi lomba diperbarui. Periksa kembali informasi terbaru lalu kirim ulang.");
        if (!Open(c)) return Conflict("Pendaftaran LMP sedang ditutup. Silakan periksa jadwal atau hubungi panitia.");
        if (c.DocumentRequired && pdf is null) return ApiBadRequest("Berkas PDF pendaftaran wajib diunggah.");
        var subject = await repository.GetSubjectAsync(request.Subjects[0]);
        if (subject is null) return ApiBadRequest("Mata pelajaran tidak tersedia.");
        var eventVersion = await repository.GetOrCreateEventAsync(c);
        var entry = new LmpApplication {
            PaymentProof = new LmpPaymentProof { AccountHolderName = request.TransferAccountName.Trim(), ContentType = optimizedProof.ContentType, Content = optimizedProof.Content },
            SubmissionKey = request.SubmissionKey, Event = eventVersion,
            StudentName = request.StudentName.Trim(), PreviousSchool = request.PreviousSchool.Trim(), Grade = request.Grade,
            SubjectId = subject.Id, ContactName = request.ContactName.Trim(), ContactPhone = request.ContactPhone,
            Attachment = pdf is null ? null : new LmpDocument { Content = pdf }, SubmittedAt = DateTime.UtcNow
        };
        repository.Applications.Add(entry); await unitOfWork.SaveChangesAsync();
        entry.RegistrationNumber = $"LMP-{(entry.Event.CompetitionDate?.Year ?? Today().Year)}-{entry.Id:D6}";
        await unitOfWork.SaveChangesAsync(); await transaction.CommitAsync();
        return await Receipt(entry, c);
    }
    private async Task<ServiceResult> Receipt(LmpApplication entry, LmpConfig config)
    {
        var subject = (await repository.Applications.SelectAsync(x => x.Subject.Name, x => x.Id == entry.Id)).Single();
        var proof = await repository.GetPaymentProofInfoAsync(entry.Id);
        return ApiOk(new {
            transferAccountName = proof?.AccountHolderName, hasPaymentProof = proof is not null,
            entry.RegistrationNumber, EventTitle = entry.Event.Title, entry.Event.CompetitionDate, entry.Event.FeeAmount,
            entry.StudentName, entry.PreviousSchool, entry.Grade, subjects = subject, entry.ContactName, entry.ContactPhone,
            entry.SubmittedAt, entry.PaymentStatus, hasDocument = await repository.HasDocumentAsync(entry.Id),
            config.AfterSubmit, config.WhatsappGroupUrl
        }, "Pendaftaran berhasil diterima.");
    }
    public async Task<ServiceResult> CheckStatus(LmpLookupRequest request, CancellationToken cancellationToken = default)
    {
        var name = request.StudentName.Trim().ToLowerInvariant();
        if (name.Length < 2 || name.Length > 150) return ApiBadRequest("Masukkan nama lengkap peserta sesuai data pendaftaran.");
        var matches = await repository.Applications.SelectAsync(
            x => new { x.RegistrationNumber, x.StudentName, x.PreviousSchool, x.Grade, subjects = x.Subject.Name,
                EventTitle = x.Event.Title, x.Event.CompetitionDate, x.SubmittedAt, x.Status, x.PaymentStatus },
            x => x.StudentName.Trim().ToLower() == name, x => x.SubmittedAt, descending: true, take: 20, thenBy: x => x.Id, cancellationToken: cancellationToken);
        if (matches.Count == 0) return ApiOk(new { found = false, registrations = Array.Empty<object>() });
        var settings = await repository.GetSettingsAsync();
        return ApiOk(new { found = true, registrations = matches.Select(x => new {
            x.RegistrationNumber, x.StudentName, x.PreviousSchool, x.Grade, x.subjects, x.EventTitle,
            x.CompetitionDate, x.SubmittedAt, x.Status, x.PaymentStatus, settings.Config.WhatsappGroupUrl
        }) });
    }

    private static System.Linq.Expressions.Expression<Func<LmpApplication, bool>> ApplicantFilter(string? search, string? subject, int? grade, string? status, string? payment) => x =>
            (string.IsNullOrWhiteSpace(search) || x.StudentName.Contains(search) || x.PreviousSchool.Contains(search) || x.RegistrationNumber.Contains(search)) &&
            (string.IsNullOrEmpty(subject) || x.Subject.Name == subject) && (!grade.HasValue || x.Grade == grade) &&
            (string.IsNullOrEmpty(status) || x.Status == status) && (string.IsNullOrEmpty(payment) || x.PaymentStatus == payment);
    public async Task<ApplicantReport> Export(string? search, string? subject, int? grade, string? status, string? payment, CancellationToken cancellationToken = default)
    {
        var items = await repository.Applications.SelectAsync(x => new { x.RegistrationNumber, EventTitle = x.Event.Title, x.StudentName, x.PreviousSchool, x.Grade, Subject = x.Subject.Name, x.ContactName, x.ContactPhone, x.Event.FeeAmount, x.Status, x.PaymentStatus, x.SubmittedAt }, ApplicantFilter(search, subject, grade, status, payment), x => x.Id, descending: true, cancellationToken: cancellationToken);
        return new ApplicantReport(ApplicantReport.FileNameFor("lmp"), "Pendaftar LMP",
            ["Nomor pendaftaran", "Acara", "Nama peserta", "Asal sekolah", "Kelas", "Mata pelajaran", "Orang tua / pendamping", "WhatsApp", "Biaya (Rp)", "Status pendaftaran", "Status pembayaran", "Waktu submit (WIB)"],
            items.Select(x => new string[] { x.RegistrationNumber, x.EventTitle, x.StudentName, x.PreviousSchool, x.Grade.ToString(), x.Subject, x.ContactName, x.ContactPhone, x.FeeAmount.ToString(System.Globalization.CultureInfo.InvariantCulture), x.Status, x.PaymentStatus, ApplicantReport.Wib(x.SubmittedAt) }).ToList(),
            $"Mata pelajaran: {ApplicantReport.FilterValue(subject, "Semua mata pelajaran")}   |   Kelas: {(grade.HasValue ? grade.Value.ToString() : "Semua kelas")}",
            $"Status: {ApplicantReport.FilterValue(status, "Semua status")}   |   Pembayaran: {ApplicantReport.FilterValue(payment, "Semua pembayaran")}   |   Pencarian: {ApplicantReport.FilterValue(search, "Semua pendaftar")}");
    }
    public async Task<ServiceResult> List(string? search, string? subject, int? grade, string? status, string? payment, int page = 1, int limit = 10)
    {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        var filter = ApplicantFilter(search, subject, grade, status, payment);
        var total = await repository.Applications.CountAsync(filter);
        var items = await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.StudentName, x.PreviousSchool, x.Grade, subjects = x.Subject.Name, x.Status, x.PaymentStatus, x.SubmittedAt }, filter, x => x.Id, descending: true, skip: (page-1)*limit, take: limit);
        return ApiOk(new { items, total });
    }
    public async Task<ServiceResult> Detail(int id)
    {
        var proof = await repository.GetPaymentProofInfoAsync(id);
        var x = await repository.Applications.FirstAsync(x => x.Id == id);
        return x is null ? ApiNotFound() : ApiOk(new { x.Id, x.RegistrationNumber, transferAccountName = proof?.AccountHolderName, hasPaymentProof = proof is not null, EventTitle = x.Event.Title, x.Event.CompetitionDate, x.StudentName, x.PreviousSchool, x.Grade, subjects = x.Subject.Name, x.ContactName, x.ContactPhone, x.Event.FeeAmount, hasDocument = await repository.HasDocumentAsync(id), x.Status, x.PaymentStatus, x.SubmittedAt, x.Version });
    }
    public async Task<ServiceResult> Document(int id)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id);
        if (entry is null) return ApiNotFound();
        var bytes = await repository.GetDocumentAsync(id);
        return bytes is null ? ApiNotFound() : ApiOk(new FileDownload($"{entry.RegistrationNumber}.pdf", bytes));
    }
    public async Task<ServiceResult> PaymentProof(int id)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id);
        if (entry is null) return ApiNotFound();
        var proof = await repository.GetPaymentProofFileAsync(id);
        return proof is null ? ApiNotFound("Bukti transfer belum tersedia untuk pendaftar ini.") : ApiOk(new PaymentProofDownload($"{entry.RegistrationNumber}-bukti-transfer{PaymentProofFiles.Extension(proof.ContentType)}", proof.ContentType, proof.Content));
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

using System.Data;
using System.Text.Json;
using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController, Route("api/lmp")]
[Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
public class LmpController(DentalCareDbContext db) : ApiControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly string[] Subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
    private static DateOnly Today() => DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);
    private static LmpConfig Read(LmpSettings row) => JsonSerializer.Deserialize<LmpConfig>(row.ConfigJson, JsonOptions) ?? new();
    private static bool Open(LmpConfig c) => c.Enabled && c.RegistrationStart.HasValue && c.RegistrationEnd.HasValue && Today() >= c.RegistrationStart && Today() <= c.RegistrationEnd;
    private static object View(LmpSettings row) { var config = Read(row); return new { config, row.Version, isOpen = Open(config), today = Today() }; }

    [HttpGet("settings")]
    public async Task<IActionResult> Settings() => ApiOk(View(await db.LmpSettings.AsNoTracking().SingleAsync(x => x.Id == 1)));
    [AllowAnonymous, HttpGet("information")]
    public async Task<IActionResult> Public() => await Settings();

    [HttpPut("settings")]
    public async Task<IActionResult> Save(LmpSettingsRequest request)
    {
        var c = request.Config;
        if (c.RegistrationStart.HasValue != c.RegistrationEnd.HasValue || c.RegistrationStart > c.RegistrationEnd || (c.Enabled && !c.RegistrationStart.HasValue))
            return ApiBadRequest("Lengkapi tanggal mulai dan selesai pendaftaran secara berurutan sebelum dibuka.");
        if (c.CompetitionDate.HasValue && c.RegistrationEnd > c.CompetitionDate) return ApiBadRequest("Pendaftaran tidak boleh berakhir setelah tanggal lomba.");
        if (c.CompetitionDate.HasValue && c.AnnouncementDate < c.CompetitionDate) return ApiBadRequest("Pengumuman tidak boleh sebelum tanggal lomba.");
        var group = c.WhatsappGroupUrl?.Trim() ?? "";
        if (group.Length > 0 && !(Uri.TryCreate(group, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.Host == "chat.whatsapp.com" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo) && uri.AbsolutePath.Length > 1))
            return ApiBadRequest("Gunakan tautan undangan grup https://chat.whatsapp.com/...");
        c.WhatsappGroupUrl = group;
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        var row = (await db.LmpSettings.FromSqlRaw("SELECT * FROM lmp_settings WHERE Id = 1 FOR UPDATE").ToListAsync()).Single();
        if (row.Version != request.Version) return Conflict(new { success = false, message = "Pengaturan berubah. Muat ulang sebelum menyimpan." });
        row.ConfigJson = JsonSerializer.Serialize(c, JsonOptions); row.Version++;
        await db.SaveChangesAsync(); await tx.CommitAsync();
        return ApiOk(View(row), "Informasi LMP disimpan.");
    }

    [AllowAnonymous, HttpPost("applications")]
    [RequestSizeLimit(2200000), RequestFormLimits(MultipartBodyLengthLimit = 2200000)]
    public async Task<IActionResult> Submit([FromForm] LmpSubmissionRequest request, IFormFile? document)
    {
        if (request.SubmissionKey == Guid.Empty || !request.Consent) return ApiBadRequest("Identitas pengiriman dan persetujuan wajib diisi.");
        if (request.Subjects.Any(s => !Subjects.Contains(s)) || request.Subjects.Distinct().Count() != request.Subjects.Count)
            return ApiBadRequest("Pilihan mata pelajaran tidak valid.");
        byte[]? pdf = null;
        if (document is not null)
        {
            if (document.Length == 0 || document.Length > 2 * 1024 * 1024 || !Path.GetExtension(document.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                return ApiBadRequest("Berkas harus berupa PDF, maksimal 2 MB.");
            using var stream = new MemoryStream(); await document.CopyToAsync(stream); pdf = stream.ToArray();
            if (pdf.Length < 8 || !pdf.AsSpan(0, 5).SequenceEqual("%PDF-"u8)) return ApiBadRequest("Isi berkas bukan PDF yang valid.");
        }
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
        var settings = (await db.LmpSettings.FromSqlRaw("SELECT * FROM lmp_settings WHERE Id = 1 FOR UPDATE").ToListAsync()).Single();
        var config = Read(settings);
        var prior = await db.LmpApplications.AsNoTracking().Where(x => x.SubmissionKey == request.SubmissionKey)
            .Select(x => new { x.RegistrationNumber, x.EventTitle, x.CompetitionDate, x.FeeAmount }).SingleOrDefaultAsync();
        if (prior is not null) return ApiOk(new { prior.RegistrationNumber, prior.EventTitle, prior.CompetitionDate, prior.FeeAmount, config.AfterSubmit, config.WhatsappGroupUrl });
        if (settings.Version != request.SettingsVersion) return Conflict(new { success = false, message = "Informasi lomba diperbarui. Periksa kembali informasi terbaru lalu kirim ulang." });
        if (!Open(config)) return Conflict(new { success = false, message = "Pendaftaran LMP sedang ditutup. Silakan periksa jadwal atau hubungi panitia." });
        if (request.Subjects.Count != 1) return ApiBadRequest("Pilih satu mata pelajaran.");
        if (config.DocumentRequired && pdf is null) return ApiBadRequest("Berkas PDF pendaftaran wajib diunggah.");
        var entry = new LmpApplication {
            SubmissionKey = request.SubmissionKey, EventTitle = config.Title, CompetitionDate = config.CompetitionDate,
            StudentName = request.StudentName.Trim(), PreviousSchool = request.PreviousSchool.Trim(), Grade = request.Grade,
            Subjects = string.Join(", ", Subjects.Where(request.Subjects.Contains)), ContactName = request.ContactName.Trim(), ContactPhone = request.ContactPhone,
            FeeAmount = config.FeeAmount, Document = pdf, SubmittedAt = DateTime.UtcNow
        };
        db.LmpApplications.Add(entry); await db.SaveChangesAsync();
        entry.RegistrationNumber = $"LMP-{(entry.CompetitionDate?.Year ?? Today().Year)}-{entry.Id:D6}";
        await db.SaveChangesAsync(); await tx.CommitAsync();
        return ApiOk(new { entry.RegistrationNumber, entry.EventTitle, entry.CompetitionDate, entry.FeeAmount, config.AfterSubmit, config.WhatsappGroupUrl }, "Pendaftaran berhasil diterima.");
    }

    [HttpGet("applications")]
    public async Task<IActionResult> List(string? search, string? subject, int? grade, string? status, string? payment, int page = 1, int limit = 10)
    {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        var query = db.LmpApplications.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.StudentName.Contains(search) || x.PreviousSchool.Contains(search) || x.RegistrationNumber.Contains(search));
        if (!string.IsNullOrEmpty(subject)) query = query.Where(x => x.Subjects.Contains(subject));
        if (grade.HasValue) query = query.Where(x => x.Grade == grade);
        if (!string.IsNullOrEmpty(status)) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrEmpty(payment)) query = query.Where(x => x.PaymentStatus == payment);
        var total = await query.CountAsync();
        var items = await query.OrderByDescending(x => x.Id).Skip((page - 1) * limit).Take(limit).Select(x => new {
            x.Id, x.RegistrationNumber, x.StudentName, x.PreviousSchool, x.Grade, x.Subjects, x.Status, x.PaymentStatus, x.SubmittedAt
        }).ToListAsync();
        return ApiOk(new { items, total });
    }
    [HttpGet("applications/{id:int}")]
    public async Task<IActionResult> Detail(int id)
    {
        var entry = await db.LmpApplications.AsNoTracking().Where(x => x.Id == id).Select(x => new {
            x.Id, x.RegistrationNumber, x.EventTitle, x.CompetitionDate, x.StudentName, x.PreviousSchool, x.Grade, x.Subjects,
            x.ContactName, x.ContactPhone, x.FeeAmount, hasDocument = x.Document != null, x.Status, x.PaymentStatus, x.SubmittedAt, x.Version
        }).SingleOrDefaultAsync();
        return entry is null ? ApiNotFound() : ApiOk(entry);
    }
    [HttpGet("applications/{id:int}/document")]
    public async Task<IActionResult> Document(int id)
    {
        var entry = await db.LmpApplications.AsNoTracking().Where(x => x.Id == id).Select(x => new { x.Document, x.RegistrationNumber }).SingleOrDefaultAsync();
        if (entry?.Document is null) return ApiNotFound();
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers.CacheControl = "no-store";
        return File(entry.Document, "application/pdf", $"{entry.RegistrationNumber}.pdf");
    }
    [HttpPut("applications/{id:int}/status")]
    public async Task<IActionResult> Status(int id, LmpStatusRequest request)
    {
        var row = await db.LmpApplications.SingleOrDefaultAsync(x => x.Id == id);
        if (row is null) return ApiNotFound();
        if (row.Version != request.Version) return Conflict(new { success = false, message = "Data berubah. Buka ulang detail peserta." });
        row.Status = request.Status; row.PaymentStatus = request.PaymentStatus; row.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Data berubah. Buka ulang detail peserta." }); }
        return ApiOk(new { row.Status, row.PaymentStatus, row.Version });
    }
}

using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Services;


public class SpmbService(ISpmbRepository repository, IApplicationUnitOfWork unitOfWork, IRegistrationFileOptimizer fileOptimizer) : ApplicationService
{
    // Purwakarta uses WIB (UTC+07). Submission time is determined by the server.
    private static DateOnly SchoolDate() => DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);
    private static bool Active(SpmbWave wave, DateOnly today) => wave.StartDate.HasValue && wave.EndDate.HasValue && today >= wave.StartDate && today <= wave.EndDate;

    private static object Schedule(SpmbSettings settings, List<SpmbWave> waves, List<SpmbWaveGroup>? groups = null)
    {
        var today = SchoolDate();
        return new
        {
            settings.AcademicYear, settings.Enabled, settings.Version, today, timeZone = "Asia/Jakarta",
            activeWave = settings.Enabled ? waves.FirstOrDefault(w => Active(w, today))?.Number : null,
            waves = waves.OrderBy(w => w.Number).Select(w => new { w.Number, w.StartDate, w.EndDate, isOpen = settings.Enabled && Active(w, today), whatsappGroupUrl = groups?.SingleOrDefault(g => g.WaveNumber == w.Number)?.WhatsappGroupUrl })
        };
    }
    public async Task<ServiceResult> Settings()
    {
        var settings = await repository.GetSettingsAsync();
        return ApiOk(Schedule(settings, await repository.GetWavesAsync(), await repository.Groups.ListAsync(g => g.AcademicYear == settings.AcademicYear)));
    }

    public async Task<ServiceResult> PublicSchedule()
    {
        var settings = await repository.GetSettingsAsync();
        return ApiOk(Schedule(settings, await repository.GetWavesAsync()));
    }

    public async Task<ServiceResult> CheckStatus(SpmbLookupRequest request, CancellationToken cancellationToken = default)
    {
        var name = request.StudentName.Trim().ToLowerInvariant();
        var nisn = request.Nisn.Trim();
        if (name.Length < 2 || name.Length > 150 || !System.Text.RegularExpressions.Regex.IsMatch(nisn, "^[0-9]{10}$"))
            return ApiBadRequest("Masukkan nama lengkap dan NISN 10 digit sesuai data pendaftaran.");
        // Exact identity pair only. Project public fields without loading family profiles or files.
        var matches = await repository.Applications.SelectAsync(
            x => new { x.RegistrationNumber, x.StudentName, x.Nisn, x.AcademicYear, x.WaveNumber, x.SubmittedAt, x.PreviousSchool, x.TargetGrade, x.Status, x.PaymentStatus },
            x => x.Nisn == nisn && x.StudentName.Trim().ToLower() == name,
            x => x.SubmittedAt, descending: true, take: 1, thenBy: x => x.Id, cancellationToken: cancellationToken);
        var entry = matches.SingleOrDefault();
        if (entry is null) return ApiOk(new { found = false });
        var group = await repository.Groups.FirstAsync(g => g.AcademicYear == entry.AcademicYear && g.WaveNumber == entry.WaveNumber, cancellationToken: cancellationToken);
        return ApiOk(new { found = true, registration = new {
            entry.RegistrationNumber, entry.StudentName, entry.Nisn, entry.AcademicYear, entry.WaveNumber,
            entry.SubmittedAt, entry.PreviousSchool, entry.TargetGrade, entry.Status, entry.PaymentStatus,
            whatsappGroupUrl = group?.WhatsappGroupUrl ?? ""
        } });
    }

    public async Task<ServiceResult> UpdateSettings(SpmbSettingsRequest request)
    {
        if (request.Waves.Count != 4 || request.Waves.Any(w => w is null) || request.Waves.Select(w => w.Number).Distinct().Count() != 4)
            return ApiBadRequest("Harus ada tepat empat gelombang, bernomor 1 sampai 4.");
        var years = request.AcademicYear.Split('/').Select(int.Parse).ToArray();
        if (years[1] != years[0] + 1) return ApiBadRequest("Tahun ajaran harus berurutan, misalnya 2027/2028.");
        foreach (var wave in request.Waves)
        {
            wave.WhatsappGroupUrl = wave.WhatsappGroupUrl?.Trim() ?? "";
            if (wave.WhatsappGroupUrl.Length > 0 &&
                (!Uri.TryCreate(wave.WhatsappGroupUrl, UriKind.Absolute, out var url) ||
                 url.Scheme != Uri.UriSchemeHttps || !url.Host.Equals("chat.whatsapp.com", StringComparison.OrdinalIgnoreCase) ||
                 !url.IsDefaultPort || url.UserInfo.Length > 0 ||
                 !System.Text.RegularExpressions.Regex.IsMatch(url.AbsolutePath, "^/[A-Za-z0-9]+/?$")))
                return ApiBadRequest($"Tautan grup WhatsApp Gelombang {wave.Number} harus berupa https://chat.whatsapp.com/kode-undangan.");
            if (wave.StartDate.HasValue != wave.EndDate.HasValue)
                return ApiBadRequest($"Tanggal mulai dan selesai Gelombang {wave.Number} harus diisi berpasangan.");
            if (wave.StartDate > wave.EndDate) return ApiBadRequest($"Tanggal selesai Gelombang {wave.Number} tidak boleh sebelum tanggal mulai.");
        }
        var configured = request.Waves.Where(w => w.StartDate.HasValue).OrderBy(w => w.Number).ToList();
        for (var i = 1; i < configured.Count; i++)
            if (configured[i].StartDate <= configured[i - 1].EndDate)
                return ApiBadRequest("Tanggal gelombang harus berurutan dan tidak boleh bertumpuk, termasuk tanggal batas.");
        if (request.Enabled && configured.Count == 0) return ApiBadRequest("Isi jadwal setidaknya satu gelombang sebelum membuka pendaftaran.");

        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true);
        if (request.Version != settings.Version) return Conflict("Pengaturan telah berubah. Muat ulang sebelum menyimpan.");
        await repository.EnsureAcademicYearAsync(request.AcademicYear);
        settings.AcademicYear = request.AcademicYear;
        settings.Enabled = request.Enabled;
        settings.Version++;
        var waves = await repository.GetWavesAsync(tracking: true);
        foreach (var wave in waves)
        {
            var value = request.Waves.Single(w => w.Number == wave.Number);
            wave.StartDate = value.StartDate; wave.EndDate = value.EndDate; // Compatibility with the existing database constraint; dates determine availability.
            wave.Enabled = value.StartDate.HasValue && value.EndDate.HasValue;
            var group = await repository.Groups.FirstAsync(g => g.AcademicYear == settings.AcademicYear && g.WaveNumber == wave.Number, tracking: true);
            if (group is null)
            {
                group = new SpmbWaveGroup { AcademicYear = settings.AcademicYear, WaveNumber = wave.Number };
                repository.Groups.Add(group);
            }
            group.WhatsappGroupUrl = value.WhatsappGroupUrl!;
        }
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();
        var groups = await repository.Groups.ListAsync(g => g.AcademicYear == settings.AcademicYear);
        return ApiOk(Schedule(settings, waves, groups), "Pengaturan gelombang disimpan.");
    }

    private async Task<ServiceResult> Receipt(SpmbApplication entry)
    {
        var group = await repository.Groups.FirstAsync(g => g.AcademicYear == entry.AcademicYear && g.WaveNumber == entry.WaveNumber);
        var proof = await repository.GetPaymentProofInfoAsync(entry.Id);
        return ApiOk(new {
            profile = await repository.GetProfileAsync(entry.Id),
            entry.PaymentStatus,
            transferAccountName = proof?.AccountHolderName, hasPaymentProof = proof is not null, hasDocument = await repository.HasDocumentAsync(entry.Id),
            entry.RegistrationNumber, entry.AcademicYear, entry.WaveNumber, entry.SubmittedAt,
            entry.StudentName, entry.Nisn, entry.BirthPlace, entry.BirthDate, entry.Gender,
            entry.PreviousSchool, entry.TargetGrade, entry.GuardianName, entry.GuardianPhone,
            entry.GuardianEmail, entry.Address,
            whatsappGroupUrl = group?.WhatsappGroupUrl ?? ""
        }, "Pendaftaran berhasil disimpan.");
    }


    public async Task<ServiceResult> Submit(SpmbSubmissionRequest request, PaymentProofUpload? paymentProof, PdfUpload? document = null, CancellationToken cancellationToken = default)
    {
        // The website now requests physical documents at re-registration. Accept optional
        // PDFs from older clients during deployment; historical downloads remain available.
        CompressedPdf? compressedDocument = null;
        if (document is not null) {
            if (document.Content.Length is < 8 or > 1048576 || !Path.GetExtension(document.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase) || !document.Content.AsSpan(0, 5).SequenceEqual("%PDF-"u8))
                return ApiBadRequest("PDF persyaratan harus valid, maksimal 1 MB.");
            compressedDocument = await fileOptimizer.CompressPdfAsync(document.Content, cancellationToken);
        }
        var proofType = PaymentProofFiles.ContentType(paymentProof);
        if (proofType is null) return ApiBadRequest("Bukti transfer wajib berupa JPG, PNG, atau PDF yang valid, maksimal 1 MB.");
        if (string.IsNullOrWhiteSpace(request.TransferAccountName)) return ApiBadRequest("Nama pemilik rekening pengirim wajib diisi.");
        if (decimal.Round(request.HeightCm, 1) != request.HeightCm || decimal.Round(request.WeightKg, 1) != request.WeightKg) return ApiBadRequest("Tinggi dan berat badan maksimal satu angka desimal.");
        var today = SchoolDate();
        if (request.SubmissionKey == Guid.Empty) return ApiBadRequest("Identitas pengiriman tidak valid. Muat ulang formulir.");
        var nisn = string.IsNullOrWhiteSpace(request.Nisn) ? null : request.Nisn;
        if (!request.Consent) return ApiBadRequest("Konfirmasi kebenaran data dan persetujuan untuk dihubungi sekolah wajib dicentang.");
        if (request.BirthDate == default || request.BirthDate >= today || request.BirthDate < today.AddYears(-30))
            return ApiBadRequest("Tanggal lahir calon siswa tidak valid.");
        if (nisn is null) return ApiBadRequest("NISN wajib diisi untuk seluruh calon murid.");
        if ((request.EntryType == "Baru") != (request.TargetGrade == "VII")) return ApiBadRequest("Pilihan masuk sekolah tidak sesuai dengan kelas tujuan.");
        var parentDigits = new string(request.ParentPhone.Where(char.IsDigit).ToArray());
        if (parentDigits.Length is < 8 or > 15) return ApiBadRequest("Nomor HP ayah/ibu harus terdiri dari 8 sampai 15 digit.");
        var digits = new string(request.GuardianPhone.Where(char.IsDigit).ToArray());
        if (digits.Length < 8 || digits.Length > 15) return ApiBadRequest("Nomor WhatsApp harus terdiri dari 8 sampai 15 digit.");

        // Serialize submissions with schedule changes so the stored wave is unambiguous.
        var optimizedProof = await fileOptimizer.OptimizeAsync(new PaymentProofFile(proofType, paymentProof!.Content), cancellationToken);
        if (optimizedProof is null) return ApiBadRequest("Bukti transfer gambar tidak dapat dibaca atau resolusinya terlalu besar. Unggah JPG/PNG yang valid dengan resolusi lebih kecil.");
        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true);
        var prior = await repository.Applications.FirstAsync(x => x.SubmissionKey == request.SubmissionKey);
        if (prior is not null) return await Receipt(prior);
        if (request.ScheduleVersion != settings.Version) return Conflict("Jadwal pendaftaran baru diperbarui. Periksa jadwal terbaru lalu kirim kembali.");
        var now = DateTime.UtcNow;
        today = DateOnly.FromDateTime(new DateTimeOffset(now).ToOffset(TimeSpan.FromHours(7)).DateTime);
        var wave = (await repository.GetWavesAsync()).SingleOrDefault(w => Active(w, today));
        if (!settings.Enabled || wave is null) return Conflict("Pendaftaran sedang ditutup. Silakan periksa jadwal gelombang atau hubungi sekolah.");
        if (nisn is not null && await repository.Applications.AnyAsync(x => x.AcademicYear == settings.AcademicYear && x.Nisn == nisn))
            return Conflict("NISN sudah terdaftar pada tahun ajaran ini. Hubungi sekolah untuk konfirmasi.");
        var period = await repository.GetOrCreatePeriodAsync(settings.AcademicYear, wave);
        var entry = new SpmbApplication
        {
            Profile = new SpmbApplicantProfile { Nickname = RegistrationText.Upper(request.Nickname), Religion = request.Religion.Trim(), MedicalHistory = RegistrationText.Upper(request.MedicalHistory), HeightCm = request.HeightCm, WeightKg = request.WeightKg, BloodGroup = request.BloodGroup.Trim(), ParentPhone = request.ParentPhone.Trim(), FatherName = RegistrationText.Upper(request.FatherName), MotherName = RegistrationText.Upper(request.MotherName), FatherOccupation = RegistrationText.Upper(request.FatherOccupation), MotherOccupation = RegistrationText.Upper(request.MotherOccupation), GuardianOccupation = RegistrationText.Upper(request.GuardianOccupation), ParentAddress = RegistrationText.Upper(request.ParentAddress), EconomicCondition = request.EconomicCondition.Trim(), DailyLanguage = RegistrationText.Upper(request.DailyLanguage) },
            Document = compressedDocument is null ? null : new SpmbDocument { Content = compressedDocument.Content, Compression = compressedDocument.Compression, OriginalLength = compressedDocument.OriginalLength },
            PaymentProof = new SpmbPaymentProof { AccountHolderName = RegistrationText.Upper(request.TransferAccountName), ContentType = optimizedProof.ContentType, Content = optimizedProof.Content },
            SubmissionKey = request.SubmissionKey, AcademicYear = settings.AcademicYear, WaveNumber = wave.Number,
            Period = period, WaveRevision = period.Revision,
            StudentName = RegistrationText.Upper(request.StudentName), Nisn = nisn, BirthPlace = RegistrationText.Upper(request.BirthPlace), BirthDate = request.BirthDate,
            Gender = request.Gender, PreviousSchool = RegistrationText.Upper(request.PreviousSchool), TargetGrade = request.TargetGrade,
            GuardianName = RegistrationText.Upper(request.GuardianName), GuardianPhone = (request.GuardianPhone.StartsWith('+') ? "+" : "") + digits,
            GuardianEmail = string.IsNullOrWhiteSpace(request.GuardianEmail) ? null : request.GuardianEmail.Trim(), Address = RegistrationText.Upper(request.Address),
            SubmittedAt = now, UpdatedAt = now
        };
        repository.Applications.Add(entry);
        await unitOfWork.SaveChangesAsync();
        entry.RegistrationNumber = $"SPMB-{settings.AcademicYear[..4]}-{entry.Id:D6}";
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();
        return await Receipt(entry);
    }
    private static System.Linq.Expressions.Expression<Func<SpmbApplication, bool>> ApplicantFilter(string? year, int? wave, string? status, string? search, string? payment) => x =>
            (string.IsNullOrEmpty(year) || x.AcademicYear == year) && (!wave.HasValue || x.WaveNumber == wave) &&
            (string.IsNullOrEmpty(status) || x.Status == status) && (string.IsNullOrEmpty(payment) || x.PaymentStatus == payment) && (string.IsNullOrWhiteSpace(search) || x.StudentName.Contains(search) || x.RegistrationNumber.Contains(search) || (x.Nisn != null && x.Nisn.Contains(search)));
    public async Task<ApplicantReport> Export(string? year, int? wave, string? status, string? search, string? payment, CancellationToken cancellationToken = default)
    {
        var items = await repository.Applications.SelectAsync(x => new { x.Profile, x.RegistrationNumber, x.AcademicYear, x.WaveNumber, x.StudentName, x.Nisn, x.BirthPlace, x.BirthDate, x.Gender, x.PreviousSchool, x.TargetGrade, x.GuardianName, x.GuardianPhone, x.GuardianEmail, x.Address, x.Status, x.PaymentStatus, x.SubmittedAt }, ApplicantFilter(year, wave, status, search, payment), x => x.Id, descending: true, cancellationToken: cancellationToken);
        return new ApplicantReport(ApplicantReport.FileNameFor("spmb"), "Pendaftar SPMB",
            ["Nomor pendaftaran", "Tahun ajaran", "Gelombang", "Nama calon siswa", "NISN", "Tempat lahir", "Tanggal lahir", "Jenis kelamin", "Asal sekolah", "Kelas tujuan", "Nama wali", "WhatsApp", "Email", "Alamat", "Status pendaftaran", "Status pembayaran", "Waktu submit (WIB)", "Nama panggilan", "Agama", "Riwayat penyakit", "Tinggi badan (cm)", "Berat badan (kg)", "Golongan darah", "No. HP ayah/ibu", "Nama ayah", "Nama ibu", "Pekerjaan ayah", "Pekerjaan ibu", "Pekerjaan wali", "Alamat orang tua/wali", "Keadaan ekonomi", "Bahasa sehari-hari", "Masuk sekolah sebagai"],
            items.Select(x => new string[] { x.RegistrationNumber, x.AcademicYear, x.WaveNumber.ToString(), x.StudentName, x.Nisn ?? "", x.BirthPlace, x.BirthDate.ToString("dd/MM/yyyy"), x.Gender, x.PreviousSchool, x.TargetGrade, x.GuardianName, x.GuardianPhone, x.GuardianEmail ?? "", x.Address, x.Status, x.PaymentStatus, ApplicantReport.Wib(x.SubmittedAt), x.Profile?.Nickname ?? "", x.Profile?.Religion ?? "", x.Profile?.MedicalHistory ?? "", x.Profile?.HeightCm.ToString(System.Globalization.CultureInfo.InvariantCulture) ?? "", x.Profile?.WeightKg.ToString(System.Globalization.CultureInfo.InvariantCulture) ?? "", x.Profile?.BloodGroup ?? "", x.Profile?.ParentPhone ?? "", x.Profile?.FatherName ?? "", x.Profile?.MotherName ?? "", x.Profile?.FatherOccupation ?? "", x.Profile?.MotherOccupation ?? "", x.Profile?.GuardianOccupation ?? "", x.Profile?.ParentAddress ?? "", x.Profile?.EconomicCondition ?? "", x.Profile?.DailyLanguage ?? "", x.TargetGrade == "VII" ? "Murid baru kelas VII" : "Pindahan" }).ToList(),
            $"Tahun ajaran: {ApplicantReport.FilterValue(year, "Semua tahun")}   |   Gelombang: {(wave.HasValue ? wave.Value.ToString() : "Semua gelombang")}   |   Status: {ApplicantReport.FilterValue(status, "Semua status")}",
            $"Pembayaran: {ApplicantReport.FilterValue(payment, "Semua pembayaran")}   |   Pencarian: {ApplicantReport.FilterValue(search, "Semua pendaftar")}");
    }
    public async Task<ServiceResult> Applications(string? year, int? wave, string? status, string? search, int page = 1, int limit = 10, string? payment = null)
    {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        var filter = ApplicantFilter(year, wave, status, search, payment);
        var total = await repository.Applications.CountAsync(filter);
        var years = await repository.GetAcademicYearsAsync();
        var items = await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.AcademicYear, x.WaveNumber, x.StudentName, x.PreviousSchool, x.TargetGrade, x.Status, x.PaymentStatus, x.SubmittedAt }, filter, x => x.Id, descending: true, skip: (page - 1) * limit, take: limit);
        return ApiOk(new { items, total, page, limit, years });
    }
    public async Task<ServiceResult> Detail(int id)
    {
        var proof = await repository.GetPaymentProofInfoAsync(id);
        var hasDocument = await repository.HasDocumentAsync(id);
        var profile = await repository.GetProfileAsync(id);
        var entry = (await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.AcademicYear, x.WaveNumber, WaveStartDate = x.Period.StartDate, WaveEndDate = x.Period.EndDate, x.StudentName, x.Nisn, x.BirthPlace, x.BirthDate, x.Gender, x.PreviousSchool, x.TargetGrade, x.GuardianName, x.GuardianPhone, x.GuardianEmail, x.Address, x.Status, x.PaymentStatus, x.SubmittedAt, x.UpdatedAt, x.Version, hasDocument, profile, transferAccountName = proof == null ? null : proof.AccountHolderName, hasPaymentProof = proof != null }, x => x.Id == id)).SingleOrDefault();
        return entry is null ? ApiNotFound("Pendaftar tidak ditemukan.") : ApiOk(entry);
    }
    public async Task<ServiceResult> Document(int id)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id);
        if (entry is null) return ApiNotFound();
        var bytes = await repository.GetDocumentAsync(id);
        return bytes is null ? ApiNotFound("Berkas persyaratan belum tersedia.") : ApiOk(new FileDownload($"{entry.RegistrationNumber}-persyaratan.pdf", bytes));
    }
    public async Task<ServiceResult> PaymentProof(int id)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id);
        if (entry is null) return ApiNotFound();
        var proof = await repository.GetPaymentProofFileAsync(id);
        return proof is null ? ApiNotFound("Bukti transfer belum tersedia untuk pendaftar ini.") : ApiOk(new PaymentProofDownload($"{entry.RegistrationNumber}-bukti-transfer{PaymentProofFiles.Extension(proof.ContentType)}", proof.ContentType, proof.Content));
    }
    public async Task<ServiceResult> Status(int id, SpmbStatusRequest request)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id, tracking: true);
        if (entry is null) return ApiNotFound();
        if (entry.Version != request.Version) return Conflict("Data sudah berubah. Buka ulang detail pendaftar.");
        entry.Status = request.Status;
        if (request.PaymentStatus is not null) entry.PaymentStatus = request.PaymentStatus;
        entry.UpdatedAt = DateTime.UtcNow; entry.Version++;
        try { await unitOfWork.SaveChangesAsync(); }
        catch (StorageConcurrencyException) { return Conflict("Data sudah berubah. Buka ulang detail pendaftar."); }
        return ApiOk(new { entry.Status, entry.PaymentStatus, entry.Version }, "Status pendaftaran disimpan.");
    }
}

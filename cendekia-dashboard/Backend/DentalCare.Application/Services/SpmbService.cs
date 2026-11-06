using DentalCare.Application.Abstractions;
using DentalCare.Domain.School;

namespace DentalCare.Application.Services;


public class SpmbService(ISpmbRepository repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    // Purwakarta uses WIB (UTC+07). Submission time is determined by the server.
    private static DateOnly SchoolDate() => DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);
    private static bool Active(SpmbWave wave, DateOnly today) => wave.Enabled && wave.StartDate.HasValue && wave.EndDate.HasValue && today >= wave.StartDate && today <= wave.EndDate;

    private static object Schedule(SpmbSettings settings, List<SpmbWave> waves)
    {
        var today = SchoolDate();
        return new
        {
            settings.AcademicYear, settings.Enabled, settings.Version, today, timeZone = "Asia/Jakarta",
            activeWave = settings.Enabled ? waves.FirstOrDefault(w => Active(w, today))?.Number : null,
            waves = waves.OrderBy(w => w.Number).Select(w => new { w.Number, w.StartDate, w.EndDate, w.Enabled, isOpen = settings.Enabled && Active(w, today) })
        };
    }
    public async Task<ServiceResult> Settings()
    {
        var settings = await repository.GetSettingsAsync();
        return ApiOk(Schedule(settings, await repository.GetWavesAsync()));
    }

    public async Task<ServiceResult> PublicSchedule() => await Settings();

    public async Task<ServiceResult> UpdateSettings(SpmbSettingsRequest request)
    {
        if (request.Waves.Count != 4 || request.Waves.Any(w => w is null) || request.Waves.Select(w => w.Number).Distinct().Count() != 4)
            return ApiBadRequest("Harus ada tepat empat gelombang, bernomor 1 sampai 4.");
        var years = request.AcademicYear.Split('/').Select(int.Parse).ToArray();
        if (years[1] != years[0] + 1) return ApiBadRequest("Tahun ajaran harus berurutan, misalnya 2027/2028.");
        foreach (var wave in request.Waves)
        {
            if (wave.StartDate.HasValue != wave.EndDate.HasValue || (wave.Enabled && !wave.StartDate.HasValue))
                return ApiBadRequest($"Tanggal mulai dan selesai Gelombang {wave.Number} wajib lengkap sebelum diaktifkan.");
            if (wave.StartDate > wave.EndDate) return ApiBadRequest($"Tanggal selesai Gelombang {wave.Number} tidak boleh sebelum tanggal mulai.");
        }
        var configured = request.Waves.Where(w => w.StartDate.HasValue).OrderBy(w => w.Number).ToList();
        for (var i = 1; i < configured.Count; i++)
            if (configured[i].StartDate <= configured[i - 1].EndDate)
                return ApiBadRequest("Tanggal gelombang harus berurutan dan tidak boleh bertumpuk, termasuk tanggal batas.");
        if (request.Enabled && !request.Waves.Any(w => w.Enabled)) return ApiBadRequest("Aktifkan setidaknya satu gelombang sebelum membuka pendaftaran.");

        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true);
        if (request.Version != settings.Version) return Conflict("Pengaturan telah berubah. Muat ulang sebelum menyimpan.");
        settings.AcademicYear = request.AcademicYear;
        settings.Enabled = request.Enabled;
        settings.Version++;
        var waves = await repository.GetWavesAsync(tracking: true);
        foreach (var wave in waves)
        {
            var value = request.Waves.Single(w => w.Number == wave.Number);
            wave.StartDate = value.StartDate; wave.EndDate = value.EndDate; wave.Enabled = value.Enabled;
        }
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();
        return ApiOk(Schedule(settings, waves), "Pengaturan gelombang disimpan.");
    }

    private ServiceResult Receipt(SpmbApplication entry) => ApiOk(new { entry.RegistrationNumber, entry.AcademicYear, entry.WaveNumber, entry.SubmittedAt }, "Pendaftaran berhasil disimpan.");


    public async Task<ServiceResult> Submit(SpmbSubmissionRequest request)
    {
        var today = SchoolDate();
        if (request.SubmissionKey == Guid.Empty) return ApiBadRequest("Identitas pengiriman tidak valid. Muat ulang formulir.");
        var nisn = string.IsNullOrWhiteSpace(request.Nisn) ? null : request.Nisn;
        if (!request.Consent) return ApiBadRequest("Konfirmasi kebenaran data dan persetujuan untuk dihubungi sekolah wajib dicentang.");
        if (request.BirthDate == default || request.BirthDate >= today || request.BirthDate < today.AddYears(-30))
            return ApiBadRequest("Tanggal lahir calon siswa tidak valid.");
        if (request.TargetGrade != "VII" && nisn is null) return ApiBadRequest("NISN wajib diisi untuk murid pindahan.");
        var digits = new string(request.GuardianPhone.Where(char.IsDigit).ToArray());
        if (digits.Length < 8 || digits.Length > 15) return ApiBadRequest("Nomor WhatsApp harus terdiri dari 8 sampai 15 digit.");

        // Serialize submissions with schedule changes so the stored wave is unambiguous.
        await using var transaction = await unitOfWork.BeginTransactionAsync();
        var settings = await repository.GetSettingsAsync(forUpdate: true);
        var prior = await repository.Applications.FirstAsync(x => x.SubmissionKey == request.SubmissionKey);
        if (prior is not null) return Receipt(prior);
        if (request.ScheduleVersion != settings.Version) return Conflict("Jadwal pendaftaran baru diperbarui. Periksa jadwal terbaru lalu kirim kembali.");
        var now = DateTime.UtcNow;
        today = DateOnly.FromDateTime(new DateTimeOffset(now).ToOffset(TimeSpan.FromHours(7)).DateTime);
        var wave = (await repository.GetWavesAsync()).SingleOrDefault(w => Active(w, today));
        if (!settings.Enabled || wave is null) return Conflict("Pendaftaran sedang ditutup. Silakan periksa jadwal gelombang atau hubungi sekolah.");
        if (nisn is not null && await repository.Applications.AnyAsync(x => x.AcademicYear == settings.AcademicYear && x.Nisn == nisn))
            return Conflict("NISN sudah terdaftar pada tahun ajaran ini. Hubungi sekolah untuk konfirmasi.");
        var entry = new SpmbApplication
        {
            SubmissionKey = request.SubmissionKey, AcademicYear = settings.AcademicYear, WaveNumber = wave.Number,
            WaveStartDate = wave.StartDate!.Value, WaveEndDate = wave.EndDate!.Value,
            StudentName = request.StudentName.Trim(), Nisn = nisn, BirthPlace = request.BirthPlace.Trim(), BirthDate = request.BirthDate,
            Gender = request.Gender, PreviousSchool = request.PreviousSchool.Trim(), TargetGrade = request.TargetGrade,
            GuardianName = request.GuardianName.Trim(), GuardianPhone = (request.GuardianPhone.StartsWith('+') ? "+" : "") + digits,
            GuardianEmail = string.IsNullOrWhiteSpace(request.GuardianEmail) ? null : request.GuardianEmail.Trim(), Address = request.Address.Trim(),
            SubmittedAt = now, UpdatedAt = now
        };
        repository.Applications.Add(entry);
        await unitOfWork.SaveChangesAsync();
        entry.RegistrationNumber = $"SPMB-{settings.AcademicYear[..4]}-{entry.Id:D6}";
        await unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();
        return Receipt(entry);
    }
    public async Task<ServiceResult> Applications(string? year, int? wave, string? status, string? search, int page = 1, int limit = 10)
    {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        System.Linq.Expressions.Expression<Func<SpmbApplication, bool>> filter = x =>
            (string.IsNullOrEmpty(year) || x.AcademicYear == year) && (!wave.HasValue || x.WaveNumber == wave) &&
            (string.IsNullOrEmpty(status) || x.Status == status) && (string.IsNullOrWhiteSpace(search) || x.StudentName.Contains(search) || x.RegistrationNumber.Contains(search) || (x.Nisn != null && x.Nisn.Contains(search)));
        var total = await repository.Applications.CountAsync(filter);
        var years = await repository.GetAcademicYearsAsync();
        var items = await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.AcademicYear, x.WaveNumber, x.StudentName, x.PreviousSchool, x.TargetGrade, x.Status, x.SubmittedAt }, filter, x => x.Id, descending: true, skip: (page - 1) * limit, take: limit);
        return ApiOk(new { items, total, page, limit, years });
    }
    public async Task<ServiceResult> Detail(int id)
    {
        var entry = (await repository.Applications.SelectAsync(x => new { x.Id, x.RegistrationNumber, x.AcademicYear, x.WaveNumber, x.WaveStartDate, x.WaveEndDate, x.StudentName, x.Nisn, x.BirthPlace, x.BirthDate, x.Gender, x.PreviousSchool, x.TargetGrade, x.GuardianName, x.GuardianPhone, x.GuardianEmail, x.Address, x.Status, x.SubmittedAt, x.UpdatedAt, x.Version }, x => x.Id == id)).SingleOrDefault();
        return entry is null ? ApiNotFound("Pendaftar tidak ditemukan.") : ApiOk(entry);
    }
    public async Task<ServiceResult> Status(int id, SpmbStatusRequest request)
    {
        var entry = await repository.Applications.FirstAsync(x => x.Id == id, tracking: true);
        if (entry is null) return ApiNotFound();
        if (entry.Version != request.Version) return Conflict("Data sudah berubah. Buka ulang detail pendaftar.");
        entry.Status = request.Status; entry.UpdatedAt = DateTime.UtcNow; entry.Version++;
        try { await unitOfWork.SaveChangesAsync(); }
        catch (StorageConcurrencyException) { return Conflict("Data sudah berubah. Buka ulang detail pendaftar."); }
        return ApiOk(new { entry.Status, entry.Version }, "Status pendaftaran disimpan.");
    }
}

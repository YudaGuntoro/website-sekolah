using System.Net.Mail;
using System.Text.RegularExpressions;
using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Services;

public class WebsiteSettingsService(IEntityRepository<WebsiteSettings> repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    public async Task<ServiceResult> Get() { var value = await repository.FirstAsync(x => x.Id == 1); return value is null ? ApiNotFound() : ApiOk(value); }
    public async Task<ServiceResult> Public() { var x = await repository.FirstAsync(x => x.Id == 1); return x is null ? ApiNotFound() : ApiOk(new { x.WhatsappNumber, x.Email, x.Address, x.InstagramUrl, x.TiktokUrl, x.FacebookUrl }); }
    public async Task<ServiceResult> Save(WebsiteSettingsRequest request)
    {
        var phone = request.WhatsappNumber.Trim(); var email = request.Email.Trim();
        var instagram = request.InstagramUrl.Trim(); var tiktok = request.TiktokUrl.Trim(); var facebook = request.FacebookUrl.Trim();
        var digits = Regex.Replace(phone, "[^0-9]", "");
        if (phone.Length > 0 && (!Regex.IsMatch(phone, @"^\+?[0-9][0-9 ()-]*$") || digits.Length is < 8 or > 15 || !(digits.StartsWith("0") || digits.StartsWith("62"))))
            return ApiBadRequest("Nomor WhatsApp harus berupa nomor Indonesia, diawali 08 atau +62 (8-15 digit).");
        if (email.Length > 0 && (!MailAddress.TryCreate(email, out var parsed) || parsed.Address != email || email.Any(char.IsWhiteSpace))) return ApiBadRequest("Alamat email tidak valid.");
        if (!ValidSocial(instagram, "instagram.com") || !ValidSocial(tiktok, "tiktok.com") || !ValidSocial(facebook, "facebook.com")) return ApiBadRequest("Gunakan URL HTTPS sesuai platform Instagram, TikTok, atau Facebook.");
        var value = await repository.FirstAsync(x => x.Id == 1, tracking: true);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict("Pengaturan telah berubah. Muat ulang sebelum menyimpan.");
        value.WhatsappNumber = phone; value.Email = email; value.Address = request.Address.Trim(); value.InstagramUrl = instagram; value.TiktokUrl = tiktok; value.FacebookUrl = facebook; value.Version++;
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Pengaturan telah berubah. Muat ulang sebelum menyimpan."); }
        return ApiOk(value, "Kontak dan media sosial disimpan.");
    }
    private static bool ValidSocial(string value, string domain) => value.Length == 0 || (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo) && (uri.Host == domain || uri.Host == "www." + domain || uri.Host == "m." + domain) && uri.AbsolutePath.Length > 1);
}
public class HomepageImagesService(IEntityRepository<HomepageImages> repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    public async Task<ServiceResult> Get() { var value = await repository.FirstAsync(x => x.Id == 1); return value is null ? ApiNotFound() : ApiOk(value); }
    public async Task<ServiceResult> Public() { var x = await repository.FirstAsync(x => x.Id == 1); return x is null ? ApiNotFound() : ApiOk(new { x.HeroUrl, x.DirectionUrl, x.ProgramUrl }); }
    public async Task<ServiceResult> Save(HomepageImagesRequest request)
    {
        if (!ValidImage(request.HeroUrl) || !ValidImage(request.DirectionUrl) || !ValidImage(request.ProgramUrl)) return ApiBadRequest("Gunakan URL gambar HTTPS atau path /images/. Kosongkan untuk memakai gambar bawaan.");
        var value = await repository.FirstAsync(x => x.Id == 1, tracking: true);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict("Gambar telah diubah. Muat ulang pengaturan sebelum menyimpan.");
        value.HeroUrl = request.HeroUrl.Trim(); value.DirectionUrl = request.DirectionUrl.Trim(); value.ProgramUrl = request.ProgramUrl.Trim(); value.Version++;
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Gambar telah diubah. Muat ulang sebelum menyimpan."); }
        return ApiOk(value, "Gambar beranda diperbarui.");
    }
    private static bool ValidImage(string value) => string.IsNullOrWhiteSpace(value) || (value.Trim().StartsWith("/images/") && !value.Contains("..") && !value.Contains('\\') && !value.Any(char.IsControl)) || (Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo));
}
public class SchoolIdentityService(IEntityRepository<SchoolIdentity> repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    private static List<SchoolMission> Missions(SchoolIdentity value) => value.MissionRecords.OrderBy(x => x.Position).Select(x => new SchoolMission { Title = x.Title, Text = x.Text }).ToList();
    public async Task<ServiceResult> Get() { var x = await repository.FirstAsync(x => x.Id == 1); return x is null ? ApiNotFound() : ApiOk(new { x.Vision, x.Motto, missions = Missions(x), x.Version }); }
    public async Task<ServiceResult> Public() { var x = await repository.FirstAsync(x => x.Id == 1); return x is null ? ApiNotFound() : ApiOk(new { x.Vision, x.Motto, missions = Missions(x) }); }
    public async Task<ServiceResult> Save(SchoolIdentityRequest request)
    {
        if (request.Missions.Any(x => x is null || string.IsNullOrWhiteSpace(x.Title) || string.IsNullOrWhiteSpace(x.Text))) return ApiBadRequest("Setiap poin misi harus memiliki judul dan isi.");
        var value = await repository.FirstAsync(x => x.Id == 1, tracking: true);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict("Visi, misi, atau motto telah berubah. Muat ulang sebelum menyimpan.");
        value.Vision = request.Vision.Trim(); value.Motto = request.Motto.Trim(); value.Version++;
        value.MissionRecords.Sort((a,b) => a.Position.CompareTo(b.Position));
        OrderedChildren.Replace(value.MissionRecords, request.Missions, () => new SchoolMissionRecord { IdentityId = value.Id }, (row, item, position) => { row.Position = position; row.Title = item.Title.Trim(); row.Text = item.Text.Trim(); });
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Data telah berubah. Muat ulang sebelum menyimpan."); }
        return ApiOk(new { value.Vision, value.Motto, missions = Missions(value), value.Version }, "Visi, misi, dan motto disimpan.");
    }
}
internal static class OrderedChildren
{
    // Reuse rows by ordinal to avoid replacing every child ID or conflicting unique positions.
    public static void Replace<T, TInput>(List<T> rows, IReadOnlyList<TInput> input, Func<T> create, Action<T,TInput,int> apply) {
        while (rows.Count > input.Count) rows.RemoveAt(rows.Count - 1);
        for (var i = 0; i < input.Count; i++) { if (i >= rows.Count) rows.Add(create()); apply(rows[i], input[i], i + 1); }
    }
}
public class SpmbInformationService(IEntityRepository<SpmbInformation> repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    private static SpmbInformationConfig Read(SpmbInformation value) {
        var c = value.Config;
        c.Steps = value.StepRecords.OrderBy(x => x.Position).Select(x => new SpmbInformationStep { Title = x.Title, Description = x.Description, Icon = x.Icon, ShowPayment = x.ShowPayment }).ToList();
        c.NewStudentDocuments = value.DocumentRecords.Where(x => x.ApplicantType == "new").OrderBy(x => x.Position).Select(x => x.Description).ToList();
        c.TransferDocuments = value.DocumentRecords.Where(x => x.ApplicantType == "transfer").OrderBy(x => x.Position).Select(x => x.Description).ToList();
        return c;
    }
    public async Task<ServiceResult> Get() { var value = await repository.FirstAsync(x => x.Id == 1); return value is null ? ApiNotFound() : ApiOk(new { config = Read(value), value.Version }); }
    public async Task<ServiceResult> Public() { var value = await repository.FirstAsync(x => x.Id == 1); return value is null ? ApiNotFound() : ApiOk(Read(value)); }
    public async Task<ServiceResult> Save(SpmbInformationRequest request)
    {
        var c = request.Config;
        if (c.Steps.Any(s => s is null || string.IsNullOrWhiteSpace(s.Title)) || c.Steps.Count(s => s.ShowPayment) > 1) return ApiBadRequest("Judul setiap tahap wajib diisi dan rincian biaya hanya boleh tampil pada satu tahap.");
        if (c.NewStudentDocuments.Concat(c.TransferDocuments).Any(s => string.IsNullOrWhiteSpace(s) || s.Length > 500)) return ApiBadRequest("Setiap persyaratan wajib diisi, maksimal 500 karakter per berkas.");
        var brochure = c.BrochureUrl.Trim();
        if (brochure.Length > 0 && !(brochure.StartsWith('/') && !brochure.StartsWith("//") && !brochure.Contains("..") && Regex.IsMatch(brochure, "^/[A-Za-z0-9_./-]+$")) && !(Uri.TryCreate(brochure, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo))) return ApiBadRequest("Brosur harus memakai URL HTTPS atau path berkas pada website sekolah.");
        var value = await repository.FirstAsync(x => x.Id == 1, tracking: true);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict("Informasi SPMB telah berubah. Muat ulang sebelum menyimpan.");
        c.Introduction = c.Introduction.Trim(); c.BrochureUrl = brochure; value.Config = c; value.Version++;
        value.StepRecords.Sort((a,b) => a.Position.CompareTo(b.Position));
        OrderedChildren.Replace(value.StepRecords, c.Steps, () => new SpmbInformationStepRecord { InformationId = value.Id }, (row, item, position) => { row.Position = position; row.Title = item.Title.Trim(); row.Description = item.Description.Trim(); row.Icon = item.Icon; row.ShowPayment = item.ShowPayment; });
        foreach (var type in new[] { "new", "transfer" }) {
            var rows = value.DocumentRecords.Where(x => x.ApplicantType == type).OrderBy(x => x.Position).ToList();
            var inputs = type == "new" ? c.NewStudentDocuments : c.TransferDocuments;
            var previous = rows.ToList();
            OrderedChildren.Replace(rows, inputs, () => new SpmbDocumentRequirement { InformationId = value.Id, ApplicantType = type }, (row, item, position) => { row.Position = position; row.Description = item.Trim(); });
            foreach (var removed in previous.Except(rows)) value.DocumentRecords.Remove(removed);
            foreach (var added in rows.Except(previous)) value.DocumentRecords.Add(added);
        }
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Informasi SPMB telah berubah. Muat ulang sebelum menyimpan."); }
        return ApiOk(new { config = Read(value), value.Version }, "Informasi SPMB disimpan.");
    }
}

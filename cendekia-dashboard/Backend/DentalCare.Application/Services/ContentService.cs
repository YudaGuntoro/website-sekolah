using DentalCare.Application.Abstractions;
using DentalCare.Domain.School;
namespace DentalCare.Application.Services;
public class ContentService(IContentRepository repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    public static readonly string[] Collections = ["berita", "pengumuman", "instagram", "tiktok", "profil", "sambutan", "guru", "prestasi", "fasilitas", "program", "kegiatan", "ekstrakurikuler", "osis", "spmb"];
    public async Task<ServiceResult> Dashboard() => ApiOk(new { counts = await repository.GetCountsAsync(), recent = await repository.ListAsync(orderBy: x => x.UpdatedAt, descending: true, take: 6) });
    public async Task<ServiceResult> List(string collection) => !Collections.Contains(collection) ? ApiNotFound() : ApiOk(await repository.ListAsync(x => x.Collection == collection, x => x.Id, descending: true));
    public async Task<ServiceResult> Create(string collection, ContentRequest request) {
        if (!Collections.Contains(collection)) return ApiNotFound();
        if (!ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        var entry = new SchoolContent { Collection = collection }; Apply(entry, request); repository.Add(entry);
        try { await unitOfWork.SaveChangesAsync(); } catch (DuplicateRecordException) { return Conflict("Slug sudah digunakan. Gunakan slug lain."); }
        return ApiCreated(entry);
    }
    public async Task<ServiceResult> Update(string collection, int id, ContentRequest request) {
        var entry = await repository.FirstAsync(x => x.Collection == collection && x.Id == id, tracking: true);
        if (entry is null) return ApiNotFound();
        if (entry.Version != request.Version) return Conflict("Konten telah berubah. Muat ulang sebelum mengedit.");
        if (!ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        Apply(entry, request); entry.Version++;
        try { await unitOfWork.SaveChangesAsync(); } catch (StorageConcurrencyException) { return Conflict("Konten telah berubah. Muat ulang halaman."); } catch (DuplicateRecordException) { return Conflict("Slug sudah digunakan. Gunakan slug lain."); }
        return ApiOk(entry, "Konten disimpan.");
    }
    public async Task<ServiceResult> Delete(string collection, int id) {
        var entry = await repository.FirstAsync(x => x.Collection == collection && x.Id == id, tracking: true);
        if (entry is null) return ApiNotFound();
        repository.Remove(entry); await unitOfWork.SaveChangesAsync(); return ApiOk(new { id }, "Konten dihapus.");
    }
    public async Task<ServiceResult> Published() {
        var now = DateTime.UtcNow;
        return ApiOk(await repository.SelectAsync(x => new { x.Collection, x.Title, x.Slug, x.Category, x.Summary, x.Body, x.ImageUrl, x.PostUrl, x.PublishedAt, x.SortOrder }, x => x.Status == "Published" && x.PublishedAt <= now, x => x.PublishedAt!, descending: true, thenBy: x => x.Id));
    }
    private static bool ValidPostUrl(string collection, string? value)
    {
        if (collection is not ("instagram" or "tiktok")) return string.IsNullOrEmpty(value);
        if (!Uri.TryCreate(value?.Trim(), UriKind.Absolute, out var uri) || uri.Scheme != "https"
            || !string.IsNullOrEmpty(uri.UserInfo) || !uri.IsDefaultPort) return false;
        var host = uri.Host.ToLowerInvariant();
        var path = uri.AbsolutePath;
        return collection == "instagram"
            ? (host is "instagram.com" or "www.instagram.com" or "m.instagram.com")
                && System.Text.RegularExpressions.Regex.IsMatch(path, "^/(p|reel|reels|tv)/[A-Za-z0-9_-]+/?$")
            : ((host is "tiktok.com" or "www.tiktok.com" or "m.tiktok.com")
                && System.Text.RegularExpressions.Regex.IsMatch(path, "^/@[^/]+/(video|photo)/[0-9]+/?$"))
                || ((host is "vm.tiktok.com" or "vt.tiktok.com")
                    && System.Text.RegularExpressions.Regex.IsMatch(path, "^/[A-Za-z0-9]+/?$"));
    }

    private static bool ValidImage(string value) => string.IsNullOrEmpty(value)
        || (value.StartsWith("/images/") && !value.Contains(".."))
        || (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https");

    private static void Apply(SchoolContent entry, ContentRequest request)
    {
        entry.Title = request.Title.Trim();
        entry.Slug = request.Slug;
        entry.Category = request.Category.Trim();
        entry.Summary = request.Summary.Trim();
        entry.Body = request.Body.Trim();
        entry.ImageUrl = request.ImageUrl.Trim();
        entry.PostUrl = request.PostUrl?.Trim() ?? "";
        entry.Status = request.Status;
        entry.SortOrder = request.SortOrder;
        entry.PublishedAt = request.Status == "Published" ? request.PublishedAt?.ToUniversalTime() ?? DateTime.UtcNow : request.PublishedAt?.ToUniversalTime();
        entry.UpdatedAt = DateTime.UtcNow;
    }
}

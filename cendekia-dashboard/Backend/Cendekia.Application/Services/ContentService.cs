using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;
namespace Cendekia.Application.Services;
public record ContentImageUpload(string FileName, byte[] Content);
public class ContentService(IContentRepository repository, IApplicationUnitOfWork unitOfWork, IRegistrationFileOptimizer imageOptimizer) : ApplicationService
{
    public static readonly string[] Collections = ["berita", "pengumuman", "instagram", "tiktok", "profil", "sambutan", "guru", "prestasi", "fasilitas", "program", "kegiatan", "ekstrakurikuler", "osis", "spmb"];
    public const int MaxImageBytes = 2 * 1024 * 1024;
    private static string ImageUrl(Guid? id, string fallback) => id.HasValue ? $"/api/school/images/{id.Value:D}" : fallback;
    private static object View(SchoolContent x) => new { x.Id, x.Collection, x.Title, x.Slug, x.Category, x.Summary, x.Body, imageUrl = ImageUrl(x.ImageId, x.ImageUrl), x.PostUrl, x.Status, x.PublishedAt, x.SortOrder, x.Version, x.CreatedAt, x.UpdatedAt };
    public async Task<ServiceResult> Dashboard() => ApiOk(new { counts = await repository.GetCountsAsync(), recent = (await repository.ListAsync(orderBy: x => x.UpdatedAt, descending: true, take: 6)).Select(View) });
    public async Task<ServiceResult> List(string collection) => !Collections.Contains(collection) ? ApiNotFound() : ApiOk((await repository.ListAsync(x => x.Collection == collection, x => x.Id, descending: true)).Select(View));
    private async Task<ContentImageFile?> Optimize(ContentImageUpload? photo, CancellationToken cancellationToken)
    {
        if (photo is null || photo.Content.Length is < 8 || photo.Content.Length > MaxImageBytes) return null;
        var ext = Path.GetExtension(photo.FileName).ToLowerInvariant();
        var bytes = photo.Content;
        var mime = ext is ".jpg" or ".jpeg" && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? "image/jpeg"
            : ext == ".png" && bytes.AsSpan(0, 8).SequenceEqual(new byte[] {137,80,78,71,13,10,26,10}) ? "image/png" : null;
        return mime is "image/jpeg" or "image/png" ? await imageOptimizer.OptimizeContentImageAsync(mime, photo.Content, cancellationToken) : null;
    }
    public async Task<ServiceResult> Create(string collection, ContentRequest request, ContentImageUpload? photo = null, CancellationToken cancellationToken = default) {
        if (!Collections.Contains(collection)) return ApiNotFound();
        if (photo is null && !ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        if (photo is not null && (collection is "instagram" or "tiktok")) return ApiBadRequest("Gunakan tautan postingan untuk konten media sosial.");
        var optimized = await Optimize(photo, cancellationToken);
        if (photo is not null && optimized is null) return ApiBadRequest("Foto harus berupa JPG/PNG yang valid, maksimal 2 MB, dengan resolusi yang dapat diproses.");
        var entry = new SchoolContent { Collection = collection }; Apply(entry, request);
        if (optimized is not null) { entry.Image = new SchoolContentImage { Id = Guid.NewGuid(), ContentType = optimized.ContentType, Content = optimized.Content }; entry.ImageId = entry.Image.Id; entry.ImageUrl = ""; }
        repository.Add(entry);
        try { await unitOfWork.SaveChangesAsync(cancellationToken); } catch (DuplicateRecordException) { return Conflict("Slug sudah digunakan. Gunakan slug lain."); }
        return ApiCreated(View(entry));
    }
    public async Task<ServiceResult> Update(string collection, int id, ContentRequest request, ContentImageUpload? photo = null, CancellationToken cancellationToken = default) {
        var entry = await repository.FirstAsync(x => x.Collection == collection && x.Id == id, tracking: true, cancellationToken: cancellationToken);
        if (entry is null) return ApiNotFound();
        if (entry.Version != request.Version) return Conflict("Konten telah berubah. Muat ulang sebelum mengedit.");
        var keepUploaded = entry.ImageId.HasValue && request.ImageUrl == ImageUrl(entry.ImageId, "");
        if (photo is null && !keepUploaded && !ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        if (photo is not null && (collection is "instagram" or "tiktok")) return ApiBadRequest("Gunakan tautan postingan untuk konten media sosial.");
        var optimized = await Optimize(photo, cancellationToken);
        if (photo is not null && optimized is null) return ApiBadRequest("Foto harus berupa JPG/PNG yang valid, maksimal 2 MB, dengan resolusi yang dapat diproses.");
        var previous = entry.ImageId;
        Apply(entry, request); entry.Version++;
        if (optimized is not null) { entry.Image = new SchoolContentImage { Id = Guid.NewGuid(), ContentType = optimized.ContentType, Content = optimized.Content }; entry.ImageId = entry.Image.Id; entry.ImageUrl = ""; repository.Images.Add(entry.Image); }
        else if (keepUploaded) entry.ImageUrl = "";
        else entry.ImageId = null;
        if (previous.HasValue && previous != entry.ImageId) repository.Images.Remove(new SchoolContentImage { Id = previous.Value });
        try { await unitOfWork.SaveChangesAsync(cancellationToken); } catch (StorageConcurrencyException) { return Conflict("Konten telah berubah. Muat ulang halaman."); } catch (DuplicateRecordException) { return Conflict("Slug sudah digunakan. Gunakan slug lain."); }
        return ApiOk(View(entry), "Konten disimpan.");
    }
    public async Task<ServiceResult> Delete(string collection, int id) {
        var entry = await repository.FirstAsync(x => x.Collection == collection && x.Id == id, tracking: true);
        if (entry is null) return ApiNotFound();
        repository.Remove(entry);
        if (entry.ImageId.HasValue) repository.Images.Remove(new SchoolContentImage { Id = entry.ImageId.Value });
        await unitOfWork.SaveChangesAsync(); return ApiOk(new { id }, "Konten dihapus.");
    }
    public async Task<ServiceResult> Image(Guid id, bool includeDraft) {
        var image = await repository.GetImageAsync(id, includeDraft);
        return image is null ? ApiNotFound() : ApiOk(image);
    }
    public async Task<ServiceResult> Published() {
        var now = DateTime.UtcNow;
        var entries = await repository.SelectAsync(x => new { x.Collection, x.Title, x.Slug, x.Category, x.Summary, x.Body, x.ImageId, x.ImageUrl, x.PostUrl, x.PublishedAt, x.SortOrder }, x => x.Status == "Published" && x.PublishedAt <= now, x => x.PublishedAt!, descending: true, thenBy: x => x.Id);
        return ApiOk(entries.Select(x => new { x.Collection, x.Title, x.Slug, x.Category, x.Summary, x.Body, imageUrl = ImageUrl(x.ImageId, x.ImageUrl), x.PostUrl, x.PublishedAt, x.SortOrder }));
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

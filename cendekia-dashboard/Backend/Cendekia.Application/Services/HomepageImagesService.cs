using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Services;

public class HomepageImagesService(IEntityRepository<HomepageImages> repository, IEntityRepository<HomepageImageFile> files,
    IApplicationUnitOfWork unitOfWork, IRegistrationFileOptimizer optimizer) : ApplicationService
{
    public const int MaxPhotoBytes = 1024 * 1024;
    private static readonly string[] Slots = ["hero", "direction", "program", "spmb"];
    private static string PhotoUrl(string slot, int version) => $"/api/school/homepage-images/{slot}?v={version}";
    private async Task<List<string>> UploadedSlots() => await files.SelectAsync(x => x.Slot, x => x.HomepageImagesId == 1);
    private static object PublicView(HomepageImages row, List<string> uploaded) => new {
        heroUrl = uploaded.Contains("hero") ? PhotoUrl("hero", row.Version) : row.HeroUrl,
        directionUrl = uploaded.Contains("direction") ? PhotoUrl("direction", row.Version) : row.DirectionUrl,
        programUrl = uploaded.Contains("program") ? PhotoUrl("program", row.Version) : row.ProgramUrl,
        spmbUrl = uploaded.Contains("spmb") ? PhotoUrl("spmb", row.Version) : row.SpmbUrl,
    };
    private async Task<object> View(HomepageImages row)
    {
        var photos = await files.SelectAsync(x => new { x.Slot, originalBytes = x.OriginalLength, storedBytes = x.Content.Length }, x => x.HomepageImagesId == 1);
        var uploaded = photos.Select(x => x.Slot).ToList();
        return new {
            heroUrl = uploaded.Contains("hero") ? PhotoUrl("hero", row.Version) : row.HeroUrl,
            directionUrl = uploaded.Contains("direction") ? PhotoUrl("direction", row.Version) : row.DirectionUrl,
            programUrl = uploaded.Contains("program") ? PhotoUrl("program", row.Version) : row.ProgramUrl,
            spmbUrl = uploaded.Contains("spmb") ? PhotoUrl("spmb", row.Version) : row.SpmbUrl,
            row.Version, photos
        };
    }
    public async Task<ServiceResult> Get()
    {
        var row = await repository.FirstAsync(x => x.Id == 1);
        return row is null ? ApiNotFound() : ApiOk(await View(row));
    }
    public async Task<ServiceResult> Public()
    {
        var row = await repository.FirstAsync(x => x.Id == 1);
        return row is null ? ApiNotFound() : ApiOk(PublicView(row, await UploadedSlots()));
    }
    public async Task<ServiceResult> Image(string slot)
    {
        if (!Slots.Contains(slot)) return ApiNotFound();
        var photo = await files.FirstAsync(x => x.HomepageImagesId == 1 && x.Slot == slot);
        return photo is null ? ApiNotFound() : ApiOk(new ContentImageFile(photo.ContentType, photo.Content));
    }
    public async Task<ServiceResult> Save(HomepageImagesRequest request, IReadOnlyDictionary<string, ContentImageUpload>? photos = null, CancellationToken cancellationToken = default)
    {
        var row = await repository.FirstAsync(x => x.Id == 1, tracking: true, cancellationToken: cancellationToken);
        if (row is null) return ApiNotFound();
        if (row.Version != request.Version) return Conflict("Gambar telah diubah. Muat ulang pengaturan sebelum menyimpan.");
        var uploaded = await UploadedSlots();
        var urls = new Dictionary<string, string> { ["hero"] = request.HeroUrl?.Trim() ?? "", ["direction"] = request.DirectionUrl?.Trim() ?? "", ["program"] = request.ProgramUrl?.Trim() ?? "" };
        urls["spmb"] = request.SpmbUrl?.Trim() ?? (uploaded.Contains("spmb") ? PhotoUrl("spmb", row.Version) : row.SpmbUrl);
        var optimized = new Dictionary<string, ContentImageFile>();
        if (photos is not null) foreach (var (slot, photo) in photos) {
            if (!Slots.Contains(slot)) return ApiBadRequest("Posisi gambar tidak valid.");
            var bytes = photo.Content;
            if (bytes.Length is < 8 or > MaxPhotoBytes) return ApiBadRequest("Foto harus JPG/PNG yang valid, maksimal 1 MB per foto.");
            var ext = Path.GetExtension(photo.FileName).ToLowerInvariant();
            var mime = ext is ".jpg" or ".jpeg" && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? "image/jpeg"
                : ext == ".png" && bytes.AsSpan(0, 8).SequenceEqual(new byte[] {137,80,78,71,13,10,26,10}) ? "image/png" : null;
            var result = mime is null ? null : await optimizer.OptimizeContentImageAsync(mime, bytes, cancellationToken, trimTransparentPadding: true);
            if (result is null) return ApiBadRequest("Foto tidak dapat dibaca atau resolusinya terlalu besar. Gunakan JPG/PNG yang valid maksimal 1 MB.");
            optimized[slot] = result;
        }
        foreach (var (slot, url) in urls)
            if (!optimized.ContainsKey(slot) && !(uploaded.Contains(slot) && url == PhotoUrl(slot, row.Version)) && !ValidImage(url))
                return ApiBadRequest("Gunakan URL HTTPS atau path /images/. Kosongkan untuk memakai gambar bawaan.");

        await using var transaction = await unitOfWork.BeginTransactionAsync(cancellationToken);
        foreach (var slot in Slots) {
            if (optimized.TryGetValue(slot, out var photo)) {
                var entry = uploaded.Contains(slot) ? await files.FirstAsync(x => x.HomepageImagesId == 1 && x.Slot == slot, tracking: true, cancellationToken: cancellationToken) : null;
                if (entry is null) { entry = new HomepageImageFile { Slot = slot }; files.Add(entry); }
                entry.ContentType = photo.ContentType; entry.Content = photo.Content; entry.OriginalLength = photos![slot].Content.Length;
                urls[slot] = "";
            }
            else if (uploaded.Contains(slot)) {
                if (urls[slot] == PhotoUrl(slot, row.Version)) urls[slot] = "";
                else files.Remove(new HomepageImageFile { Slot = slot });
            }
        }
        row.HeroUrl = urls["hero"]; row.DirectionUrl = urls["direction"]; row.ProgramUrl = urls["program"]; row.SpmbUrl = urls["spmb"]; row.Version++;
        try { await unitOfWork.SaveChangesAsync(cancellationToken); }
        catch (StorageConcurrencyException) { return Conflict("Gambar telah diubah. Muat ulang sebelum menyimpan."); }
        catch (DuplicateRecordException) { return Conflict("Gambar telah diubah. Muat ulang sebelum menyimpan."); }
        await transaction.CommitAsync(cancellationToken);
        return ApiOk(await View(row), "Gambar beranda diperbarui.");
    }
    private static bool ValidImage(string value) => string.IsNullOrWhiteSpace(value)
        || (value.StartsWith("/images/") && !value.Contains("..") && !value.Contains('\\') && !value.Any(char.IsControl))
        || (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo));
}

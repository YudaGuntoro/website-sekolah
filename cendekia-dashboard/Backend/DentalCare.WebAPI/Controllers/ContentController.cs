using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController]
[Route("api/cms")]
[Authorize]
public class ContentController(DentalCareDbContext db) : ApiControllerBase
{
    public static readonly string[] Collections =
        ["berita", "pengumuman", "instagram", "tiktok", "profil", "sambutan", "guru", "prestasi", "fasilitas", "program", "kegiatan", "ekstrakurikuler", "osis", "spmb"];

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var counts = await db.SchoolContents.AsNoTracking()
            .GroupBy(x => new { x.Collection, x.Status })
            .Select(g => new { g.Key.Collection, g.Key.Status, Count = g.Count() }).ToListAsync();
        var recent = await db.SchoolContents.AsNoTracking().OrderByDescending(x => x.UpdatedAt).Take(6).ToListAsync();
        return ApiOk(new { counts, recent });
    }

    [HttpGet("content/{collection}")]
    public async Task<IActionResult> List(string collection)
    {
        if (!Collections.Contains(collection)) return ApiNotFound();
        return ApiOk(await db.SchoolContents.AsNoTracking().Where(x => x.Collection == collection)
            .OrderByDescending(x => x.Id).ToListAsync());
    }

    [HttpPost("content/{collection}")]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Create(string collection, ContentRequest request)
    {
        if (!Collections.Contains(collection)) return ApiNotFound();
        if (!ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        var entry = new SchoolContent { Collection = collection };
        Apply(entry, request);
        db.SchoolContents.Add(entry);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { return Conflict(new { success = false, message = "Slug sudah digunakan. Gunakan slug lain." }); }
        return ApiCreated(entry);
    }

    [HttpPut("content/{collection}/{id:int}")]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Update(string collection, int id, ContentRequest request)
    {
        var entry = await db.SchoolContents.FirstOrDefaultAsync(x => x.Collection == collection && x.Id == id);
        if (entry is null) return ApiNotFound();
        if (entry.Version != request.Version) return Conflict(new { success = false, message = "Konten telah berubah. Muat ulang sebelum mengedit." });
        if (!ValidImage(request.ImageUrl)) return ApiBadRequest("Gambar harus menggunakan URL HTTPS atau path /images/.");
        if (!ValidPostUrl(collection, request.PostUrl)) return ApiBadRequest("Masukkan URL postingan HTTPS yang valid sesuai platform Instagram atau TikTok.");
        Apply(entry, request);
        entry.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Konten telah berubah. Muat ulang halaman." }); }
        catch (DbUpdateException) { return Conflict(new { success = false, message = "Slug sudah digunakan. Gunakan slug lain." }); }
        return ApiOk(entry, "Konten disimpan.");
    }

    [HttpDelete("content/{collection}/{id:int}")]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Delete(string collection, int id)
    {
        var entry = await db.SchoolContents.FirstOrDefaultAsync(x => x.Collection == collection && x.Id == id);
        if (entry is null) return ApiNotFound();
        db.SchoolContents.Remove(entry);
        await db.SaveChangesAsync();
        return ApiOk(new { id }, "Konten dihapus.");
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

[ApiController]
[Route("api/school")]
public class SchoolPublicController(DentalCareDbContext db) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet("content")]
    public async Task<IActionResult> Published()
    {
        var now = DateTime.UtcNow;
        return ApiOk(await db.SchoolContents.AsNoTracking()
            .Where(x => x.Status == "Published" && x.PublishedAt <= now)
            // Every school collection follows the same latest-publication-first pattern.
            .OrderByDescending(x => x.PublishedAt).ThenByDescending(x => x.Id)
            .Select(x => new { x.Collection, x.Title, x.Slug, x.Category, x.Summary, x.Body, x.ImageUrl, x.PostUrl, x.PublishedAt, x.SortOrder })
            .ToListAsync());
    }
}

using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController]
[Route("api/cms/homepage-images")]
[Authorize]
public class HomepageImagesController(DentalCareDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var images = await db.HomepageImages.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return images is null ? ApiNotFound() : ApiOk(images);
    }

    [HttpGet("/api/school/homepage-images")]
    [AllowAnonymous]
    public async Task<IActionResult> Public()
    {
        var images = await db.HomepageImages.AsNoTracking().Where(x => x.Id == 1)
            .Select(x => new { x.HeroUrl, x.DirectionUrl, x.ProgramUrl }).SingleOrDefaultAsync();
        return images is null ? ApiNotFound() : ApiOk(images);
    }

    [HttpPut]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Save(HomepageImagesRequest request)
    {
        if (!ValidImage(request.HeroUrl) || !ValidImage(request.DirectionUrl) || !ValidImage(request.ProgramUrl))
            return ApiBadRequest("Gunakan URL gambar HTTPS atau path /images/. Kosongkan untuk memakai gambar bawaan.");
        var images = await db.HomepageImages.SingleOrDefaultAsync(x => x.Id == 1);
        if (images is null) return ApiNotFound();
        if (images.Version != request.Version) return Conflict(new { success = false, message = "Gambar telah diubah. Muat ulang pengaturan sebelum menyimpan." });
        images.HeroUrl = request.HeroUrl.Trim();
        images.DirectionUrl = request.DirectionUrl.Trim();
        images.ProgramUrl = request.ProgramUrl.Trim();
        images.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Gambar telah diubah. Muat ulang sebelum menyimpan." }); }
        return ApiOk(images, "Gambar beranda diperbarui.");
    }

    private static bool ValidImage(string value) => string.IsNullOrWhiteSpace(value)
        || (value.Trim().StartsWith("/images/") && !value.Contains("..") && !value.Contains('\\') && !value.Any(char.IsControl))
        || (Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo));
}

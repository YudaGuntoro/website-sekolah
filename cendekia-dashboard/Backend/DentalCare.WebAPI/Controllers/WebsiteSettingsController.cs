using System.Net.Mail;
using System.Text.RegularExpressions;
using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController]
[Route("api/cms/website-settings")]
[Authorize]
public class WebsiteSettingsController(DentalCareDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await db.WebsiteSettings.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return settings is null ? ApiNotFound("Pengaturan website belum tersedia.") : ApiOk(settings);
    }

    [HttpGet("/api/school/contact")]
    [AllowAnonymous]
    public async Task<IActionResult> Public()
    {
        var settings = await db.WebsiteSettings.AsNoTracking().Where(x => x.Id == 1)
            .Select(x => new { x.WhatsappNumber, x.Email, x.Address, x.InstagramUrl, x.TiktokUrl, x.FacebookUrl }).SingleOrDefaultAsync();
        return settings is null ? ApiNotFound() : ApiOk(settings);
    }

    [HttpPut]
    [Authorize(Roles = "ADMIN,SUPERVISOR")]
    public async Task<IActionResult> Save(WebsiteSettingsRequest request)
    {
        var phone = request.WhatsappNumber.Trim();
        var email = request.Email.Trim();
        var instagram = request.InstagramUrl.Trim();
        var tiktok = request.TiktokUrl.Trim();
        var facebook = request.FacebookUrl.Trim();
        var digits = Regex.Replace(phone, "[^0-9]", "");
        if (phone.Length > 0 && (!Regex.IsMatch(phone, @"^\+?[0-9][0-9 ()-]*$") || digits.Length is < 8 or > 15
            || !(digits.StartsWith("0") || digits.StartsWith("62"))))
            return ApiBadRequest("Nomor WhatsApp harus berupa nomor Indonesia, diawali 08 atau +62 (8-15 digit).");
        if (email.Length > 0 && (!MailAddress.TryCreate(email, out var parsed) || parsed.Address != email || email.Any(char.IsWhiteSpace)))
            return ApiBadRequest("Alamat email tidak valid.");
        if (!ValidSocial(instagram, "instagram.com") || !ValidSocial(tiktok, "tiktok.com") || !ValidSocial(facebook, "facebook.com"))
            return ApiBadRequest("Gunakan URL HTTPS sesuai platform Instagram, TikTok, atau Facebook.");
        var settings = await db.WebsiteSettings.SingleOrDefaultAsync(x => x.Id == 1);
        if (settings is null) return ApiNotFound();
        if (settings.Version != request.Version) return Conflict(new { success = false, message = "Pengaturan telah berubah. Muat ulang sebelum menyimpan." });
        settings.WhatsappNumber = phone;
        settings.Email = email;
        settings.Address = request.Address.Trim();
        settings.InstagramUrl = instagram;
        settings.TiktokUrl = tiktok;
        settings.FacebookUrl = facebook;
        settings.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Pengaturan telah berubah. Muat ulang sebelum menyimpan." }); }
        return ApiOk(settings, "Kontak dan media sosial disimpan.");
    }

    private static bool ValidSocial(string value, string domain) => value.Length == 0
        || (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort
            && string.IsNullOrEmpty(uri.UserInfo) && (uri.Host == domain || uri.Host == "www." + domain || uri.Host == "m." + domain)
            && uri.AbsolutePath.Length > 1);
}

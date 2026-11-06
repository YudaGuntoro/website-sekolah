using System.Text.Json;
using System.Text.RegularExpressions;
using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController]
[Route("api/cms/spmb-information")]
[Authorize]
public class SpmbInformationController(DentalCareDbContext db) : ApiControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static SpmbInformationConfig Read(SpmbInformation value) => JsonSerializer.Deserialize<SpmbInformationConfig>(value.ConfigJson, JsonOptions) ?? new();
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var value = await db.SpmbInformation.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return value is null ? ApiNotFound() : ApiOk(new { Config = Read(value), value.Version });
    }
    [HttpGet("/api/school/spmb-information")]
    [AllowAnonymous]
    public async Task<IActionResult> Public()
    {
        var value = await db.SpmbInformation.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return value is null ? ApiNotFound() : ApiOk(Read(value));
    }
    [HttpPut]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Save(SpmbInformationRequest request)
    {
        var config = request.Config;
        if (config.Steps.Any(s => s is null || string.IsNullOrWhiteSpace(s.Title)) || config.Steps.Count(s => s.ShowPayment) > 1)
            return ApiBadRequest("Judul setiap tahap wajib diisi dan rincian biaya hanya boleh tampil pada satu tahap.");
        if (config.NewStudentDocuments.Concat(config.TransferDocuments).Any(s => string.IsNullOrWhiteSpace(s) || s.Length > 500))
            return ApiBadRequest("Setiap persyaratan wajib diisi, maksimal 500 karakter per berkas.");
        var brochure = config.BrochureUrl.Trim();
        if (brochure.Length > 0 && !(brochure.StartsWith('/') && !brochure.StartsWith("//") && !brochure.Contains("..") && Regex.IsMatch(brochure, "^/[A-Za-z0-9_./-]+$"))
            && !(Uri.TryCreate(brochure, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo)))
            return ApiBadRequest("Brosur harus memakai URL HTTPS atau path berkas pada website sekolah.");
        var value = await db.SpmbInformation.SingleOrDefaultAsync(x => x.Id == 1);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict(new { success = false, message = "Informasi SPMB telah berubah. Muat ulang sebelum menyimpan." });
        config.Introduction = config.Introduction.Trim(); config.BrochureUrl = brochure;
        config.Steps.ForEach(s => { s.Title = s.Title.Trim(); s.Description = s.Description.Trim(); });
        config.NewStudentDocuments = config.NewStudentDocuments.Select(s => s.Trim()).ToList();
        config.TransferDocuments = config.TransferDocuments.Select(s => s.Trim()).ToList();
        value.ConfigJson = JsonSerializer.Serialize(config, JsonOptions); value.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Informasi SPMB telah berubah. Muat ulang sebelum menyimpan." }); }
        return ApiOk(new { Config = Read(value), value.Version }, "Informasi SPMB disimpan.");
    }
}

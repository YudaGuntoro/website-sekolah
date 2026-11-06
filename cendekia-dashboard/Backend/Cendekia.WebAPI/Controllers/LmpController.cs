using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/lmp"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
public class LmpController(LmpService service) : ApiControllerBase
{
    [HttpGet("settings")] public async Task<IActionResult> Settings() => FromService(await service.Settings());
    [HttpGet("information"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Settings());
    [HttpPut("settings")] public async Task<IActionResult> Save(LmpSettingsRequest request) => FromService(await service.Save(request));
    [HttpPost("applications"), EnableRateLimiting("registration"), AllowAnonymous, RequestSizeLimit(2200000), RequestFormLimits(MultipartBodyLengthLimit = 2200000)]
    public async Task<IActionResult> Submit([FromForm] LmpSubmissionRequest request, IFormFile? document) {
        PdfUpload? upload = null;
        if (document is not null) {
            if (document.Length > 2 * 1024 * 1024) return ApiBadRequest("Berkas harus berupa PDF, maksimal 2 MB.");
            using var stream = new MemoryStream(); await document.CopyToAsync(stream);
            upload = new PdfUpload(document.FileName, stream.ToArray());
        }
        return FromService(await service.Submit(request, upload));
    }
    [HttpGet("applications")] public async Task<IActionResult> List(string? search, string? subject, int? grade, string? status, string? payment, int page = 1, int limit = 10) => FromService(await service.List(search, subject, grade, status, payment, page, limit));
    [HttpGet("applications/{id:int}")] public async Task<IActionResult> Detail(int id) => FromService(await service.Detail(id));
    [HttpGet("applications/{id:int}/document")] public async Task<IActionResult> Document(int id) {
        var result = await service.Document(id);
        if (result.Data is not FileDownload download) return FromService(result);
        Response.Headers["X-Content-Type-Options"] = "nosniff"; Response.Headers.CacheControl = "no-store";
        return File(download.Content, "application/pdf", download.FileName);
    }
    [HttpPut("applications/{id:int}/status")] public async Task<IActionResult> Status(int id, LmpStatusRequest request) => FromService(await service.Status(id, request));
}

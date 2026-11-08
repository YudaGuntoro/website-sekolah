using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/spmb"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
public class SpmbController(SpmbService service) : ApiControllerBase
{
    [HttpGet("settings")] public async Task<IActionResult> Settings() => FromService(await service.Settings());
    [HttpGet("schedule"), AllowAnonymous] public async Task<IActionResult> PublicSchedule() => FromService(await service.PublicSchedule());
    [HttpPut("settings"), Authorize(Roles = "ADMIN,SUPERVISOR")] public async Task<IActionResult> UpdateSettings(SpmbSettingsRequest request) => FromService(await service.UpdateSettings(request));
    [HttpPost("applications"), EnableRateLimiting("registration"), AllowAnonymous, Consumes("multipart/form-data"), RequestSizeLimit(2200000), RequestFormLimits(MultipartBodyLengthLimit = 2200000)]
    public async Task<IActionResult> Submit([FromForm] SpmbSubmissionRequest request, IFormFile? paymentProof)
    {
        PaymentProofUpload? upload = null;
        if (paymentProof is not null) {
            if (paymentProof.Length > 1024 * 1024) return ApiBadRequest("Bukti transfer maksimal 1 MB.");
            using var stream = new MemoryStream(); await paymentProof.CopyToAsync(stream);
            upload = new PaymentProofUpload(paymentProof.FileName, stream.ToArray());
        }
        return FromService(await service.Submit(request, upload, HttpContext.RequestAborted));
    }
    [HttpGet("applications/{id:int}/payment-proof")]
    public async Task<IActionResult> PaymentProof(int id) {
        var result = await service.PaymentProof(id);
        if (result.Data is not PaymentProofDownload download) return FromService(result);
        Response.Headers["X-Content-Type-Options"] = "nosniff"; Response.Headers.CacheControl = "no-store";
        return File(download.Content, download.ContentType, download.FileName);
    }
    [HttpGet("applications/export")]
    public async Task<IActionResult> Export(string? year, int? wave, string? status, string? search) {
        var report = await service.Export(year, wave, status, search, HttpContext.RequestAborted);
        Response.Headers.CacheControl = "no-store";
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return File(Cendekia.WebAPI.Reports.XlsxReportWriter.Write(report), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", report.FileName);
    }
    [HttpGet("applications")] public async Task<IActionResult> Applications(string? year, int? wave, string? status, string? search, int page = 1, int limit = 10) => FromService(await service.Applications(year, wave, status, search, page, limit));
    [HttpGet("applications/{id:int}")] public async Task<IActionResult> Detail(int id) => FromService(await service.Detail(id));
    [HttpPut("applications/{id:int}/status")] public async Task<IActionResult> Status(int id, SpmbStatusRequest request) => FromService(await service.Status(id, request));
}

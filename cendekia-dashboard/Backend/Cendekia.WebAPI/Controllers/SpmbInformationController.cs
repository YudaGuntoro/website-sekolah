using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/cms/spmb-information"), Authorize]
public class SpmbInformationController(SpmbInformationService service) : ApiControllerBase
{
    [HttpPost("brochure"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR"), RequestSizeLimit(1100000), RequestFormLimits(MultipartBodyLengthLimit = 1100000)]
    public async Task<IActionResult> UploadBrochure([FromForm] IFormFile? file, [FromForm] int version)
    {
        if (file is null || file.Length == 0 || file.Length > 1048576) return ApiBadRequest("Brosur PDF maksimal 1 MB.");
        using var stream = new MemoryStream(); await file.CopyToAsync(stream, HttpContext.RequestAborted);
        return FromService(await service.UploadBrochure(file.FileName, stream.ToArray(), version, HttpContext.RequestAborted));
    }
    [HttpGet("/api/school/spmb-brochure"), AllowAnonymous]
    public async Task<IActionResult> Brochure()
    {
        var result = await service.Brochure();
        if (result.Data is not ContentImageFile file) return FromService(result);
        Response.Headers.CacheControl = "no-store"; Response.Headers.XContentTypeOptions = "nosniff";
        return File(file.Content, "application/pdf", "brosur-spmb.pdf");
    }
    [HttpGet] public async Task<IActionResult> Get() => FromService(await service.Get());
    [HttpGet("/api/school/spmb-information"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Public());
    [HttpPut, Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Save(SpmbInformationRequest request) => FromService(await service.Save(request));
}

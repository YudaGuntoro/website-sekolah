using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/cms"), Authorize]
public class ContentController(ContentService service) : ApiControllerBase
{
    [HttpGet("dashboard")] public async Task<IActionResult> Dashboard() => FromService(await service.Dashboard());
    [HttpGet("content/{collection}")] public async Task<IActionResult> List(string collection) => FromService(await service.List(collection));
    [HttpPost("content/{collection}"), Consumes("application/json"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Create(string collection, ContentRequest request) => FromService(await service.Create(collection, request));
    [HttpPut("content/{collection}/{id:int}"), Consumes("application/json"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Update(string collection, int id, ContentRequest request) => FromService(await service.Update(collection, id, request));
    [HttpPost("content/{collection}"), Consumes("multipart/form-data"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR"), RequestSizeLimit(2300000), RequestFormLimits(MultipartBodyLengthLimit=2300000)]
    public async Task<IActionResult> CreateWithPhoto(string collection, [FromForm] ContentRequest request, IFormFile? photo) {
        if (photo is not null && photo.Length > ContentService.MaxImageBytes) return ApiBadRequest("Foto maksimal 2 MB.");
        return FromService(await service.Create(collection, request, await ReadPhoto(photo), HttpContext.RequestAborted));
    }
    [HttpPut("content/{collection}/{id:int}"), Consumes("multipart/form-data"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR"), RequestSizeLimit(2300000), RequestFormLimits(MultipartBodyLengthLimit=2300000)]
    public async Task<IActionResult> UpdateWithPhoto(string collection, int id, [FromForm] ContentRequest request, IFormFile? photo) {
        if (photo is not null && photo.Length > ContentService.MaxImageBytes) return ApiBadRequest("Foto maksimal 2 MB.");
        return FromService(await service.Update(collection, id, request, await ReadPhoto(photo), HttpContext.RequestAborted));
    }
    private async Task<ContentImageUpload?> ReadPhoto(IFormFile? photo) {
        if (photo is null) return null;
        using var stream = new MemoryStream(); await photo.CopyToAsync(stream, HttpContext.RequestAborted);
        return new ContentImageUpload(photo.FileName, stream.ToArray());
    }
    [HttpDelete("content/{collection}/{id:int}"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Delete(string collection, int id) => FromService(await service.Delete(collection, id));
}
[ApiController, Route("api/school")]
public class SchoolPublicController(ContentService service) : ApiControllerBase
{
    [AllowAnonymous, HttpGet("images/{id:guid}")]
    public async Task<IActionResult> Image(Guid id) {
        var result = await service.Image(id, User.IsInRole("ADMIN") || User.IsInRole("SUPERVISOR") || User.IsInRole("OPERATOR"));
        if (result.Data is not ContentImageFile image) return FromService(result);
        Response.Headers["X-Content-Type-Options"] = "nosniff"; Response.Headers.CacheControl = "no-store";
        return File(image.Content, image.ContentType);
    }
    [AllowAnonymous, HttpGet("content")] public async Task<IActionResult> Published() => FromService(await service.Published());
}

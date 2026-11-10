using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/cms/homepage-images"), Authorize]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class HomepageImagesController(HomepageImagesService service) : ApiControllerBase
{
    [HttpGet] public async Task<IActionResult> Get() => FromService(await service.Get());
    [HttpGet("/api/school/homepage-images"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Public());
    [HttpPut, Consumes("application/json"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Save(HomepageImagesRequest request) => FromService(await service.Save(request));
    [HttpPut, Consumes("multipart/form-data"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR"), RequestSizeLimit(3300000), RequestFormLimits(MultipartBodyLengthLimit = 3300000)]
    public async Task<IActionResult> SavePhotos([FromForm] HomepageImagesRequest request, IFormFile? heroPhoto, IFormFile? directionPhoto, IFormFile? programPhoto)
    {
        var uploads = new Dictionary<string, ContentImageUpload>();
        var parts = new[] { ("hero", heroPhoto), ("direction", directionPhoto), ("program", programPhoto) };
        foreach (var (_, file) in parts)
            if (file is not null && (file.Length == 0 || file.Length > HomepageImagesService.MaxPhotoBytes)) return ApiBadRequest("Foto maksimal 1 MB per foto.");
        foreach (var (slot, file) in parts) {
            if (file is null) continue;
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream, HttpContext.RequestAborted);
            uploads[slot] = new ContentImageUpload(file.FileName, stream.ToArray());
        }
        return FromService(await service.Save(request, uploads, HttpContext.RequestAborted));
    }
    [HttpGet("/api/school/homepage-images/{slot}"), AllowAnonymous]
    public async Task<IActionResult> Photo(string slot)
    {
        var result = await service.Image(slot);
        if (result.Data is not ContentImageFile image) return FromService(result);
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return File(image.Content, image.ContentType);
    }
}

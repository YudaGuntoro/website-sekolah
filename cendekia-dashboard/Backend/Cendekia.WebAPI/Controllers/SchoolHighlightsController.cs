using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cendekia.WebAPI.Controllers;

[ApiController, Route("api/cms/school-highlights"), Authorize]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class SchoolHighlightsController(SchoolHighlightsService service) : ApiControllerBase
{
    [HttpGet] public async Task<IActionResult> Get() => FromService(await service.Get());
    [HttpGet("/api/school/highlights"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Public());
    [HttpPut, Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Save(SchoolHighlightsRequest request) => FromService(await service.Save(request));
}

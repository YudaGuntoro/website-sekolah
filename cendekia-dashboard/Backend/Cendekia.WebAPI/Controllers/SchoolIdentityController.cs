using Cendekia.Application.Services;
using Cendekia.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/cms/school-identity"), Authorize]
public class SchoolIdentityController(SchoolIdentityService service) : ApiControllerBase
{
    [HttpGet] public async Task<IActionResult> Get() => FromService(await service.Get());
    [HttpGet("/api/school/identity"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Public());
    [HttpPut, Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Save(SchoolIdentityRequest request) => FromService(await service.Save(request));
}

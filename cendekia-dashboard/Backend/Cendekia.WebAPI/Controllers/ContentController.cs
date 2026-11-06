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
    [HttpPost("content/{collection}"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Create(string collection, ContentRequest request) => FromService(await service.Create(collection, request));
    [HttpPut("content/{collection}/{id:int}"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Update(string collection, int id, ContentRequest request) => FromService(await service.Update(collection, id, request));
    [HttpDelete("content/{collection}/{id:int}"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Delete(string collection, int id) => FromService(await service.Delete(collection, id));
}
[ApiController, Route("api/school")]
public class SchoolPublicController(ContentService service) : ApiControllerBase
{
    [AllowAnonymous, HttpGet("content")] public async Task<IActionResult> Published() => FromService(await service.Published());
}

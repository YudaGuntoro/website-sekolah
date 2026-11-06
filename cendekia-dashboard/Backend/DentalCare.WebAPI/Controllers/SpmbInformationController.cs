using DentalCare.Application.Services;
using DentalCare.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace DentalCare.WebAPI.Controllers;
[ApiController, Route("api/cms/spmb-information"), Authorize]
public class SpmbInformationController(SpmbInformationService service) : ApiControllerBase
{
    [HttpGet] public async Task<IActionResult> Get() => FromService(await service.Get());
    [HttpGet("/api/school/spmb-information"), AllowAnonymous] public async Task<IActionResult> Public() => FromService(await service.Public());
    [HttpPut, Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")] public async Task<IActionResult> Save(SpmbInformationRequest request) => FromService(await service.Save(request));
}

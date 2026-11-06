using DentalCare.Application.Services;
using DentalCare.Domain.School;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace DentalCare.WebAPI.Controllers;
[ApiController, Route("api/spmb"), Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
public class SpmbController(SpmbService service) : ApiControllerBase
{
    [HttpGet("settings")] public async Task<IActionResult> Settings() => FromService(await service.Settings());
    [HttpGet("schedule"), AllowAnonymous] public async Task<IActionResult> PublicSchedule() => FromService(await service.Settings());
    [HttpPut("settings"), Authorize(Roles = "ADMIN,SUPERVISOR")] public async Task<IActionResult> UpdateSettings(SpmbSettingsRequest request) => FromService(await service.UpdateSettings(request));
    [HttpPost("applications"), AllowAnonymous, RequestSizeLimit(32768)] public async Task<IActionResult> Submit(SpmbSubmissionRequest request) => FromService(await service.Submit(request));
    [HttpGet("applications")] public async Task<IActionResult> Applications(string? year, int? wave, string? status, string? search, int page = 1, int limit = 10) => FromService(await service.Applications(year, wave, status, search, page, limit));
    [HttpGet("applications/{id:int}")] public async Task<IActionResult> Detail(int id) => FromService(await service.Detail(id));
    [HttpPut("applications/{id:int}/status")] public async Task<IActionResult> Status(int id, SpmbStatusRequest request) => FromService(await service.Status(id, request));
}

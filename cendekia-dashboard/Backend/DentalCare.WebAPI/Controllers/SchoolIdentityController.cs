using System.Text.Json;
using DentalCare.Domain.School;
using DentalCare.Persistence.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalCare.WebAPI.Controllers;

[ApiController]
[Route("api/cms/school-identity")]
[Authorize]
public class SchoolIdentityController(DentalCareDbContext db) : ApiControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static List<SchoolMission> Missions(SchoolIdentity value) => JsonSerializer.Deserialize<List<SchoolMission>>(value.MissionsJson, JsonOptions) ?? [];

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var value = await db.SchoolIdentity.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return value is null ? ApiNotFound() : ApiOk(new { value.Vision, value.Motto, Missions = Missions(value), value.Version });
    }

    [HttpGet("/api/school/identity")]
    [AllowAnonymous]
    public async Task<IActionResult> Public()
    {
        var value = await db.SchoolIdentity.AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1);
        return value is null ? ApiNotFound() : ApiOk(new { value.Vision, value.Motto, Missions = Missions(value) });
    }

    [HttpPut]
    [Authorize(Roles = "ADMIN,SUPERVISOR,OPERATOR")]
    public async Task<IActionResult> Save(SchoolIdentityRequest request)
    {
        if (request.Missions.Any(m => m is null || string.IsNullOrWhiteSpace(m.Title) || string.IsNullOrWhiteSpace(m.Text)))
            return ApiBadRequest("Setiap poin misi harus memiliki judul dan isi.");
        var value = await db.SchoolIdentity.SingleOrDefaultAsync(x => x.Id == 1);
        if (value is null) return ApiNotFound();
        if (value.Version != request.Version) return Conflict(new { success = false, message = "Visi, misi, atau motto telah berubah. Muat ulang sebelum menyimpan." });
        value.Vision = request.Vision.Trim();
        value.Motto = request.Motto.Trim();
        value.MissionsJson = JsonSerializer.Serialize(request.Missions.Select(m => new SchoolMission { Title = m.Title.Trim(), Text = m.Text.Trim() }), JsonOptions);
        value.Version++;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Data telah berubah. Muat ulang sebelum menyimpan." }); }
        return ApiOk(new { value.Vision, value.Motto, Missions = Missions(value), value.Version }, "Visi, misi, dan motto disimpan.");
    }
}

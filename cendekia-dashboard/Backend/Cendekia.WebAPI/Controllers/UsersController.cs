using Cendekia.Application.Services;
using Cendekia.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Cendekia.WebAPI.Controllers;
[ApiController, Route("api/users"), Authorize(Roles = "ADMIN")]
public class UsersController(UserService service) : ApiControllerBase
{
    [HttpGet] public async Task<IActionResult> GetUsers(int page = 1, int limit = 10, string? search = null, bool? isActive = null) => FromService(await service.GetUsers(page, limit, search, isActive));
    [HttpGet("{id:int}")] public async Task<IActionResult> GetUser(int id) => FromService(await service.GetUser(id));
    [HttpPost] public async Task<IActionResult> CreateUser(UserCreateRequest request) => FromService(await service.CreateUser(request));
    [HttpPut("{id:int}")] public async Task<IActionResult> UpdateUser(int id, UserUpdateRequest request) => FromService(await service.UpdateUser(id, request));
    [HttpDelete("{id:int}")] public async Task<IActionResult> DeleteUser(int id) => FromService(await service.DeleteUser(id));
}

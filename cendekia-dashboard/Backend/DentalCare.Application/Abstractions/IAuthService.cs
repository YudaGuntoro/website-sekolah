using DentalCare.Domain.Auth;
namespace DentalCare.Application.Abstractions;
public interface IAuthService { Task<LoginResponse> LoginAsync(LoginRequest request); }

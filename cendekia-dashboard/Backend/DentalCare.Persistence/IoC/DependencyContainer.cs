using DentalCare.Persistence.Services.AuthService;
using DentalCare.Persistence.Repositories;
using DentalCare.Application.Abstractions;
using DentalCare.Application.Services;
using DentalCare.Persistence.Services.Shared;
using Microsoft.Extensions.DependencyInjection;

namespace DentalCare.Persistence.IoC;

public static class DependencyContainer
{
    public static void AddIoCService(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped(typeof(IEntityRepository<>), typeof(EntityRepository<>));
        services.AddScoped<IApplicationUnitOfWork, ApplicationUnitOfWork>();
        services.AddScoped<IContentRepository, ContentRepository>();
        services.AddScoped<ISpmbRepository, SpmbRepository>();
        services.AddScoped<ILmpRepository, LmpRepository>();
        services.AddScoped<IPasswordHasher, PasswordHasherAdapter>();
        services.AddScoped<ContentService>(); services.AddScoped<WebsiteSettingsService>();
        services.AddScoped<HomepageImagesService>(); services.AddScoped<SchoolIdentityService>();
        services.AddScoped<SpmbInformationService>(); services.AddScoped<SpmbService>();
        services.AddScoped<LmpService>(); services.AddScoped<UserService>();
    }
}

internal sealed class PasswordHasherAdapter : IPasswordHasher
{
    public string CreateSalt() => AuthPasswordHasher.CreateSalt();
    public string Hash(string password, string salt) => AuthPasswordHasher.HashPassword(password, salt);
}

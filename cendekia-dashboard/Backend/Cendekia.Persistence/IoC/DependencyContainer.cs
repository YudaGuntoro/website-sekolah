using Cendekia.Persistence.Services.AuthService;
using Cendekia.Persistence.Repositories;
using Cendekia.Application.Abstractions;
using Cendekia.Application.Services;
using Cendekia.Persistence.Services.Shared;
using Microsoft.Extensions.DependencyInjection;

namespace Cendekia.Persistence.IoC;

public static class DependencyContainer
{
    public static void AddIoCService(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IReadinessProbe, ReadinessProbe>();
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

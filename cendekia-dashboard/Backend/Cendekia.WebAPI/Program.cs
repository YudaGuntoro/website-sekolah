using Cendekia.WebAPI;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, logger) => logger
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console());
builder.WebHost.ConfigureKestrel(options => {
    options.Limits.MaxRequestBodySize = 4400000;
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
});

// Add services to the container
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);

// Build the application
var app = builder.Build();


// Configure the HTTP request pipeline
app.UseCendekiaApiPipeline();

if (!app.Environment.IsDevelopment()) {
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<Cendekia.Application.Abstractions.IAuthService>().EnsureProductionReadyAsync();
}

// Run the application
app.Run();

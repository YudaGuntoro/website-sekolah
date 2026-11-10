namespace Cendekia.Application.Services;

internal static class RegistrationText
{
    internal static string Upper(string? value) => (value ?? "").Trim().ToUpperInvariant();
}

using System.Globalization;
namespace Cendekia.Application.Services;

public sealed record ApplicantReport(string FileName, string SheetName, string[] Headers, List<string[]> Rows, string FilterSummary, string SearchSummary)
{
    public DateTime GeneratedAtUtc { get; } = DateTime.UtcNow;
    public static string FilterValue(string? value, string fallback) => string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    public static string Wib(DateTime value) => DateTime.SpecifyKind(value, DateTimeKind.Utc).AddHours(7).ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
    public static string FileNameFor(string module) => $"pendaftar-{module}-{DateTime.UtcNow.AddHours(7):yyyyMMdd-HHmmss}.xlsx";
}

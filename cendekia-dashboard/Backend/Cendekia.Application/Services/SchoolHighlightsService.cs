using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Services;

public class SchoolHighlightsService(IEntityRepository<SchoolHighlights> repository, IApplicationUnitOfWork unitOfWork) : ApplicationService
{
    private static object Cards(SchoolHighlights row) => row.Cards.OrderBy(x => x.Position)
        .Select(x => new { x.Title, x.Category, x.Text, x.Value, x.Icon }).ToList();
    private static object View(SchoolHighlights row) => new { row.Heading, row.Accent, row.Description, row.Enabled, cards = Cards(row), row.Version };
    public async Task<ServiceResult> Get()
    {
        var row = await repository.FirstAsync(x => x.Id == 1);
        return row is null ? ApiNotFound() : ApiOk(View(row));
    }
    public async Task<ServiceResult> Public()
    {
        var row = await repository.FirstAsync(x => x.Id == 1);
        return row is null ? ApiNotFound() : ApiOk(new { row.Heading, row.Accent, row.Description, row.Enabled, cards = Cards(row) });
    }
    public async Task<ServiceResult> Save(SchoolHighlightsRequest request)
    {
        if (request.Cards.Any(card => card is null || string.IsNullOrWhiteSpace(card.Title))) return ApiBadRequest("Setiap kartu harus memiliki judul.");
        var row = await repository.FirstAsync(x => x.Id == 1, tracking: true);
        if (row is null) return ApiNotFound();
        if (row.Version != request.Version) return Conflict("Data statistik telah berubah. Muat ulang sebelum menyimpan.");
        row.Heading = request.Heading.Trim(); row.Accent = request.Accent?.Trim() ?? "";
        row.Description = request.Description?.Trim() ?? ""; row.Enabled = request.Enabled; row.Version++;
        row.Cards.Sort((a, b) => a.Position.CompareTo(b.Position));
        OrderedChildren.Replace(row.Cards, request.Cards, () => new SchoolHighlightRecord { HighlightsId = row.Id }, (record, card, position) => {
            record.Position = position; record.Title = card.Title.Trim(); record.Category = card.Category?.Trim() ?? "";
            record.Text = card.Text?.Trim() ?? ""; record.Value = card.Value; record.Icon = card.Icon;
        });
        try { await unitOfWork.SaveChangesAsync(); }
        catch (StorageConcurrencyException) { return Conflict("Data statistik telah berubah. Muat ulang sebelum menyimpan."); }
        return ApiOk(View(row), "Statistik beranda disimpan.");
    }
}

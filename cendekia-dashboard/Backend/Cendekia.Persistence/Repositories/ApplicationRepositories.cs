using System.Data;
using System.IO.Compression;
using System.Linq.Expressions;
using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;
using Cendekia.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MySqlConnector;

namespace Cendekia.Persistence.Repositories;

public class EntityRepository<TEntity>(CendekiaDbContext db) : IEntityRepository<TEntity> where TEntity : class
{
    protected readonly CendekiaDbContext Db = db;
    public Task<TEntity?> FirstAsync(Expression<Func<TEntity, bool>> predicate, bool tracking = false, CancellationToken cancellationToken = default)
        => (tracking ? Db.Set<TEntity>() : Db.Set<TEntity>().AsNoTracking()).FirstOrDefaultAsync(predicate, cancellationToken);
    private IQueryable<TEntity> Read(Expression<Func<TEntity, bool>>? predicate, Expression<Func<TEntity, object>>? orderBy,
        bool descending, int skip, int? take, Expression<Func<TEntity, object>>? thenBy = null)
    {
        IQueryable<TEntity> query = Db.Set<TEntity>().AsNoTracking();
        if (predicate is not null) query = query.Where(predicate);
        if (orderBy is not null) {
            var ordered = descending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
            if (thenBy is not null) ordered = descending ? ordered.ThenByDescending(thenBy) : ordered.ThenBy(thenBy);
            query = ordered;
        }
        if (skip > 0) query = query.Skip(skip);
        if (take.HasValue) query = query.Take(take.Value);
        return query;
    }
    public Task<List<TEntity>> ListAsync(Expression<Func<TEntity, bool>>? predicate = null, Expression<Func<TEntity, object>>? orderBy = null,
        bool descending = false, int skip = 0, int? take = null, CancellationToken cancellationToken = default)
        => Read(predicate, orderBy, descending, skip, take).ToListAsync(cancellationToken);
    public Task<List<TResult>> SelectAsync<TResult>(Expression<Func<TEntity, TResult>> selector, Expression<Func<TEntity, bool>>? predicate = null,
        Expression<Func<TEntity, object>>? orderBy = null, bool descending = false, int skip = 0, int? take = null,
        Expression<Func<TEntity, object>>? thenBy = null, CancellationToken cancellationToken = default)
        => Read(predicate, orderBy, descending, skip, take, thenBy).Select(selector).ToListAsync(cancellationToken);
    public Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default)
        => predicate is null ? Db.Set<TEntity>().CountAsync(cancellationToken) : Db.Set<TEntity>().CountAsync(predicate, cancellationToken);
    public Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default) => Db.Set<TEntity>().AnyAsync(predicate, cancellationToken);
    public void Add(TEntity entity) => Db.Set<TEntity>().Add(entity);
    public void Remove(TEntity entity) => Db.Set<TEntity>().Remove(entity);
}
public sealed class ApplicationUnitOfWork(CendekiaDbContext db) : IApplicationUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) {
        try { return await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException e) { throw new StorageConcurrencyException(e); }
        catch (DbUpdateException e) when (e.InnerException is MySqlException { Number: 1062 }) { throw new DuplicateRecordException(e); }
    }
    public async Task<IApplicationTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        => new ApplicationTransaction(await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken));
    private sealed class ApplicationTransaction(IDbContextTransaction transaction) : IApplicationTransaction {
        public Task CommitAsync(CancellationToken cancellationToken = default) => transaction.CommitAsync(cancellationToken);
        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
public sealed class SpmbRepository(CendekiaDbContext db) : ISpmbRepository
{
    public Task<SpmbApplicantProfile?> GetProfileAsync(int applicationId) => db.Set<SpmbApplicantProfile>().AsNoTracking().SingleOrDefaultAsync(x => x.ApplicationId == applicationId);
    public Task<bool> HasDocumentAsync(int applicationId) => db.Set<SpmbDocument>().AnyAsync(x => x.ApplicationId == applicationId);
    public async Task<byte[]?> GetDocumentAsync(int applicationId)
    {
        var document = await db.Set<SpmbDocument>().AsNoTracking().SingleOrDefaultAsync(x => x.ApplicationId == applicationId);
        if (document is null) return null;
        if (document.OriginalLength is < 1 or > 1048576) throw new InvalidDataException("Invalid PDF storage length.");
        if (document.Compression == "raw") {
            if (document.Content.Length != document.OriginalLength) throw new InvalidDataException("Invalid PDF storage length.");
            return document.Content;
        }
        if (document.Compression != "br") throw new InvalidDataException("Unknown PDF storage compression.");
        using var input = new MemoryStream(document.Content);
        using var decompressor = new BrotliStream(input, CompressionMode.Decompress);
        var bytes = new byte[document.OriginalLength];
        await decompressor.ReadExactlyAsync(bytes);
        if (decompressor.ReadByte() != -1) throw new InvalidDataException("Expanded PDF exceeds stored length.");
        return bytes;
    }
    public Task<PaymentProofInfo?> GetPaymentProofInfoAsync(int applicationId) => db.Set<SpmbPaymentProof>().Where(x => x.ApplicationId == applicationId).Select(x => new PaymentProofInfo(x.AccountHolderName)).SingleOrDefaultAsync();
    public Task<PaymentProofFile?> GetPaymentProofFileAsync(int applicationId) => db.Set<SpmbPaymentProof>().Where(x => x.ApplicationId == applicationId).Select(x => new PaymentProofFile(x.ContentType, x.Content)).SingleOrDefaultAsync();
    public IEntityRepository<SpmbWaveGroup> Groups { get; } = new EntityRepository<SpmbWaveGroup>(db);
    public async Task EnsureAcademicYearAsync(string year) {
        if (db.Database.CurrentTransaction is null) throw new InvalidOperationException("Creating years requires a settings transaction.");
        if (!await db.Set<AcademicYear>().AnyAsync(x => x.Code == year)) db.Add(new AcademicYear { Code = year });
    }
    public async Task<SpmbWavePeriod> GetOrCreatePeriodAsync(string year, SpmbWave wave) {
        if (db.Database.CurrentTransaction is null) throw new InvalidOperationException("Creating periods requires a settings transaction.");
        var periods = db.Set<SpmbWavePeriod>();
        var existing = await periods.SingleOrDefaultAsync(x => x.AcademicYear == year && x.WaveNumber == wave.Number && x.StartDate == wave.StartDate && x.EndDate == wave.EndDate);
        if (existing is not null) return existing;
        await EnsureAcademicYearAsync(year);
        var revision = (await periods.Where(x => x.AcademicYear == year && x.WaveNumber == wave.Number).MaxAsync(x => (int?)x.Revision) ?? 0) + 1;
        var period = new SpmbWavePeriod { AcademicYear = year, WaveNumber = wave.Number, Revision = revision, StartDate = wave.StartDate!.Value, EndDate = wave.EndDate!.Value };
        periods.Add(period);
        return period;
    }
    public IEntityRepository<SpmbApplication> Applications { get; } = new EntityRepository<SpmbApplication>(db);
    public async Task<SpmbSettings> GetSettingsAsync(bool forUpdate = false) {
        if (forUpdate && db.Database.CurrentTransaction is null) throw new InvalidOperationException("Locking settings requires an active unit-of-work transaction.");
        return forUpdate ? (await db.SpmbSettings.FromSqlRaw("SELECT * FROM spmb_settings WHERE Id = 1 FOR UPDATE").ToListAsync()).Single() : await db.SpmbSettings.AsNoTracking().SingleAsync(x => x.Id == 1);
    }
    public Task<List<SpmbWave>> GetWavesAsync(bool tracking = false) => (tracking ? db.SpmbWaves : db.SpmbWaves.AsNoTracking()).ToListAsync();
    public Task<List<string>> GetAcademicYearsAsync() => db.SpmbApplications.Select(x => x.AcademicYear).Distinct().OrderByDescending(x => x).ToListAsync();
}
public sealed class LmpRepository(CendekiaDbContext db) : ILmpRepository
{
    public Task<PaymentProofInfo?> GetPaymentProofInfoAsync(int applicationId) => db.Set<LmpPaymentProof>().Where(x => x.ApplicationId == applicationId).Select(x => new PaymentProofInfo(x.AccountHolderName)).SingleOrDefaultAsync();
    public Task<PaymentProofFile?> GetPaymentProofFileAsync(int applicationId) => db.Set<LmpPaymentProof>().Where(x => x.ApplicationId == applicationId).Select(x => new PaymentProofFile(x.ContentType, x.Content)).SingleOrDefaultAsync();
    public async Task<LmpEvent> GetOrCreateEventAsync(LmpConfig config) {
        if (db.Database.CurrentTransaction is null) throw new InvalidOperationException("Creating events requires a settings transaction.");
        var existing = await db.Set<LmpEvent>().SingleOrDefaultAsync(x => x.Title == config.Title && x.CompetitionDate == config.CompetitionDate && x.FeeAmount == config.FeeAmount);
        if (existing is not null) return existing;
        var value = new LmpEvent { Title = config.Title, CompetitionDate = config.CompetitionDate, FeeAmount = config.FeeAmount };
        db.Add(value);
        return value;
    }
    public IEntityRepository<LmpApplication> Applications { get; } = new EntityRepository<LmpApplication>(db);
    public async Task<LmpSettings> GetSettingsAsync(bool forUpdate = false) {
        // Lock only the root row; load its owned scalar settings in the same transaction.
        if (forUpdate && db.Database.CurrentTransaction is null) throw new InvalidOperationException("Locking settings requires an active unit-of-work transaction.");
        if (forUpdate) await db.Database.ExecuteSqlRawAsync("SELECT Id FROM lmp_settings WHERE Id = 1 FOR UPDATE");
        return await (forUpdate ? db.LmpSettings : db.LmpSettings.AsNoTracking()).SingleAsync(x => x.Id == 1);
    }
    public Task<LmpSubject?> GetSubjectAsync(string name) => db.Set<LmpSubject>().AsNoTracking().SingleOrDefaultAsync(x => x.Name == name);
    public Task<bool> HasDocumentAsync(int applicationId) => db.Set<LmpDocument>().AnyAsync(x => x.ApplicationId == applicationId);
    public Task<byte[]?> GetDocumentAsync(int applicationId) => db.Set<LmpDocument>().Where(x => x.ApplicationId == applicationId).Select(x => x.Content).SingleOrDefaultAsync();
}
public sealed class ContentRepository(CendekiaDbContext db) : EntityRepository<SchoolContent>(db), IContentRepository
{
    public IEntityRepository<SchoolContentImage> Images { get; } = new EntityRepository<SchoolContentImage>(db);
    public Task<ContentImageFile?> GetImageAsync(Guid id, bool includeDraft) {
        var now = DateTime.UtcNow;
        return Db.Set<SchoolContentImage>()
            .Where(image => image.Id == id && Db.SchoolContents.Any(content => content.ImageId == image.Id && (includeDraft || (content.Status == "Published" && content.PublishedAt <= now))))
            .Select(image => new ContentImageFile(image.ContentType, image.Content)).SingleOrDefaultAsync();
    }
    public Task<List<ContentCount>> GetCountsAsync() => Db.SchoolContents.AsNoTracking().GroupBy(x => new { x.Collection, x.Status })
        .Select(g => new ContentCount(g.Key.Collection, g.Key.Status, g.Count())).ToListAsync();
}

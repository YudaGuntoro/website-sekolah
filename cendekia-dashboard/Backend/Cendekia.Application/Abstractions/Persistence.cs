using System.Linq.Expressions;
using Cendekia.Domain.School;

namespace Cendekia.Application.Abstractions;

// Expressions describe selection without exposing IQueryable or the ORM to callers.
public interface IEntityRepository<TEntity> where TEntity : class
{
    Task<TEntity?> FirstAsync(Expression<Func<TEntity, bool>> predicate, bool tracking = false, CancellationToken cancellationToken = default);
    Task<List<TEntity>> ListAsync(Expression<Func<TEntity, bool>>? predicate = null, Expression<Func<TEntity, object>>? orderBy = null,
        bool descending = false, int skip = 0, int? take = null, CancellationToken cancellationToken = default);
    Task<List<TResult>> SelectAsync<TResult>(Expression<Func<TEntity, TResult>> selector, Expression<Func<TEntity, bool>>? predicate = null,
        Expression<Func<TEntity, object>>? orderBy = null, bool descending = false, int skip = 0, int? take = null,
        Expression<Func<TEntity, object>>? thenBy = null, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    void Add(TEntity entity);
    void Remove(TEntity entity);
}
public interface IApplicationTransaction : IAsyncDisposable { Task CommitAsync(CancellationToken cancellationToken = default); }
public interface IApplicationUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IApplicationTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
public interface ISpmbRepository
{
    Task<SpmbSettings> GetSettingsAsync(bool forUpdate = false);
    Task<List<SpmbWave>> GetWavesAsync(bool tracking = false);
    IEntityRepository<SpmbApplication> Applications { get; }
    Task<List<string>> GetAcademicYearsAsync();
    Task EnsureAcademicYearAsync(string year);
    Task<SpmbWavePeriod> GetOrCreatePeriodAsync(string year, SpmbWave wave);
}
public interface ILmpRepository
{
    Task<LmpSettings> GetSettingsAsync(bool forUpdate = false);
    IEntityRepository<LmpApplication> Applications { get; }
    Task<LmpSubject?> GetSubjectAsync(string name);
    Task<bool> HasDocumentAsync(int applicationId);
    Task<byte[]?> GetDocumentAsync(int applicationId);
    Task<LmpEvent> GetOrCreateEventAsync(LmpConfig config);
}
public interface IContentRepository : IEntityRepository<SchoolContent>
{
    Task<List<ContentCount>> GetCountsAsync();
}
public record ContentCount(string Collection, string Status, int Count);
public sealed class StorageConcurrencyException(Exception inner) : Exception("Data has changed.", inner);
public sealed class DuplicateRecordException(Exception inner) : Exception("A unique record already exists.", inner);
public interface IPasswordHasher { string CreateSalt(); string Hash(string password, string salt); }

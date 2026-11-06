namespace Cendekia.Application;

public enum ResultKind { Success, Created, NotFound, ValidationError, Conflict }
// Transport-independent outcome: mapping to HTTP belongs exclusively to the WebAPI.
public record ServiceResult(ResultKind Kind, object? Data, string Message, object? Pagination = null);
public abstract class ApplicationService
{
    protected static ServiceResult ApiOk(object? data, string message = "Data retrieved successfully") => new(ResultKind.Success, data, message);
    protected static ServiceResult ApiCreated(object? data, string message = "Data created successfully") => new(ResultKind.Created, data, message);
    protected static ServiceResult ApiNotFound(string message = "Data not found") => new(ResultKind.NotFound, null, message);
    protected static ServiceResult ApiBadRequest(string message) => new(ResultKind.ValidationError, null, message);
    protected static ServiceResult Conflict(string message) => new(ResultKind.Conflict, null, message);
}

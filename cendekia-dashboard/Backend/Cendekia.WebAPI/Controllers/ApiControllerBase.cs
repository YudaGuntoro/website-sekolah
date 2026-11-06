using Cendekia.Domain.Response;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Net;

namespace Cendekia.WebAPI.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromService(Cendekia.Application.ServiceResult result)
    {
        var status = result.Kind switch {
            Cendekia.Application.ResultKind.Success => 200,
            Cendekia.Application.ResultKind.Created => 201,
            Cendekia.Application.ResultKind.NotFound => 404,
            Cendekia.Application.ResultKind.ValidationError => 400,
            Cendekia.Application.ResultKind.Conflict => 409,
            _ => 500
        };
        return StatusCode(status, result.Pagination is null
            ? (object)new { success = status < 400, statusCode = status, message = result.Message, data = result.Data }
            : new { success = status < 400, statusCode = status, message = result.Message, data = result.Data, pagination = result.Pagination });
    }
    protected IActionResult ApiOk<T>(T data, string message = "Data retrieved successfully")
    {
        return Ok(new ApiResponse<T>
        {
            Success = true,
            StatusCode = (int)HttpStatusCode.OK,
            Message = message,
            Data = data
        });
    }

    protected IActionResult ApiCreated<T>(T data, string message = "Data created successfully")
    {
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<T>
        {
            Success = true,
            StatusCode = StatusCodes.Status201Created,
            Message = message,
            Data = data
        });
    }

    protected IActionResult ApiNotFound(string message = "Data not found")
    {
        return NotFound(new ApiResponse<string>
        {
            Success = false,
            StatusCode = (int)HttpStatusCode.NotFound,
            Message = message,
            Data = null
        });
    }

    protected IActionResult ApiBadRequest(Exception ex)
    {
        Log.Error(ex, "Request failed: {Method} {Path}", HttpContext.Request.Method, HttpContext.Request.Path);

        return StatusCode(500, new { success = false, statusCode = 500, message = "Terjadi kesalahan pada server. Silakan coba kembali.", traceId = HttpContext.TraceIdentifier });
    }

    protected IActionResult ApiBadRequest(string message)
    {
        return BadRequest(new ApiResponse<string>
        {
            Success = false,
            StatusCode = (int)HttpStatusCode.BadRequest,
            Message = message,
            Data = null
        });
    }

    protected IActionResult ApiUnauthorized(string message)
    {
        return Unauthorized(new ApiResponse<string>
        {
            Success = false,
            StatusCode = (int)HttpStatusCode.Unauthorized,
            Message = message,
            Data = null
        });
    }
}

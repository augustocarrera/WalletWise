using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using WalletWise.Application.Exceptions;

namespace WalletWise.Web.Exceptions;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, mensagem) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            ValidationException ve => (StatusCodes.Status400BadRequest,
                string.Join(" | ", ve.Errors.Select(e => e.ErrorMessage))),
            HttpRequestException => (StatusCodes.Status502BadGateway,
                "Não foi possível consultar a cotação. Tente novamente."),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno do servidor.")
        };

        if (status >= 500)
            logger.LogError(exception, "Exceção não tratada: {Mensagem}", exception.Message);

        var erro = new ApiError(status, mensagem, httpContext.Request.Path);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(erro, cancellationToken);

        return true;
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using WalletWise.Application.DTOs;
using WalletWise.Application.Queries;

namespace WalletWise.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class RelatoriosController(IMediator mediator) : ControllerBase
{
    [HttpGet("resumo-mensal")]
    [ProducesResponseType(typeof(ResumoMensalDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResumoMensal(
        [FromQuery] int ano,
        [FromQuery] int mes,
        CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(new ResumoMensalQuery(ano, mes), cancellationToken);
        return Ok(resultado);
    }
}

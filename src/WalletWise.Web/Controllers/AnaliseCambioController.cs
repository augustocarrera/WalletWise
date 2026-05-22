using Microsoft.AspNetCore.Mvc;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;

namespace WalletWise.Web.Controllers;

[ApiController]
[Route("api/analise-cambio")]
[Produces("application/json")]
public class AnaliseCambioController(IAnaliseCambioService service) : ControllerBase
{
    [HttpGet("{moeda}")]
    [ProducesResponseType(typeof(AnaliseCambioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Analisar(string moeda, CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await service.AnalisarAsync(moeda, cancellationToken);
            return Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}

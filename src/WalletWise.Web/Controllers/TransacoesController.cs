using MediatR;
using Microsoft.AspNetCore.Mvc;
using WalletWise.Application.Commands;
using WalletWise.Application.DTOs;
using WalletWise.Application.Queries;

namespace WalletWise.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TransacoesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<TransacaoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(new ListarTransacoesQuery(), cancellationToken);
        return Ok(resultado);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TransacaoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarTransacaoCommand command, CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Listar), resultado);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TransacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarTransacaoCommand command, CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(command with { Id = id }, cancellationToken);
        return Ok(resultado);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deletar(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeletarTransacaoCommand(id), cancellationToken);
        return NoContent();
    }
}

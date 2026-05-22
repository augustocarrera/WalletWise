using MediatR;
using Microsoft.AspNetCore.Mvc;
using WalletWise.Application.Commands;
using WalletWise.Application.DTOs;
using WalletWise.Application.Queries;

namespace WalletWise.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MetasController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<MetaFinanceiraDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(new ListarMetasQuery(), cancellationToken);
        return Ok(resultado);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MetaFinanceiraDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarMetaFinanceiraCommand command, CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(command, cancellationToken);
        return Created(string.Empty, resultado);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(MetaFinanceiraDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarMetaRequest request, CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(
            new AtualizarMetaCommand(id, request.Nome, request.Descricao, request.ValorAlvo, request.DataAlvo),
            cancellationToken);
        return Ok(resultado);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new ExcluirMetaCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:guid}/aporte")]
    [ProducesResponseType(typeof(MetaFinanceiraDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdicionarAporte(Guid id, [FromBody] AporteRequest request, CancellationToken cancellationToken)
    {
        var resultado = await mediator.Send(new AdicionarAporteMetaCommand(id, request.Valor), cancellationToken);
        return Ok(resultado);
    }
}

public record AporteRequest(decimal Valor);
public record AtualizarMetaRequest(string Nome, string Descricao, decimal ValorAlvo, DateTime DataAlvo);

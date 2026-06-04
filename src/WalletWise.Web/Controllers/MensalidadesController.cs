using MediatR;
using Microsoft.AspNetCore.Mvc;
using WalletWise.Application.Commands;
using WalletWise.Application.Queries;

namespace WalletWise.Web.Controllers;

[ApiController]
[Route("api/mensalidades")]
public class MensalidadesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
        => Ok(await mediator.Send(new ListarMensalidadesQuery(), ct));

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarMensalidadeCommand cmd, CancellationToken ct)
    {
        var id = await mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(Listar), new { id }, null);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarMensalidadeRequest req, CancellationToken ct)
    {
        await mediator.Send(new AtualizarMensalidadeCommand(id, req.Nome, req.Valor, req.Moeda, req.DiaVencimento), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        await mediator.Send(new ExcluirMensalidadeCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/alternar")]
    public async Task<IActionResult> Alternar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new AlternarMensalidadeCommand(id), ct);
        return NoContent();
    }
}

public record AtualizarMensalidadeRequest(string Nome, decimal Valor, string Moeda, int DiaVencimento);

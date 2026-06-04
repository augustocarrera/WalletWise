using MediatR;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class AtualizarMensalidadeCommandHandler(IMensalidadeRepository repo) : IRequestHandler<AtualizarMensalidadeCommand>
{
    public async Task Handle(AtualizarMensalidadeCommand cmd, CancellationToken ct)
    {
        var m = await repo.ObterAsync(cmd.Id, ct) ?? throw new NotFoundException("Mensalidade não encontrada.");
        m.Atualizar(cmd.Nome, cmd.Valor, cmd.Moeda, cmd.DiaVencimento);
        await repo.SalvarAsync(ct);
    }
}

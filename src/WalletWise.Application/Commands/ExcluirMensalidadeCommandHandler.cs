using MediatR;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class ExcluirMensalidadeCommandHandler(IMensalidadeRepository repo) : IRequestHandler<ExcluirMensalidadeCommand>
{
    public async Task Handle(ExcluirMensalidadeCommand cmd, CancellationToken ct)
    {
        var m = await repo.ObterAsync(cmd.Id, ct) ?? throw new NotFoundException("Mensalidade não encontrada.");
        await repo.RemoverAsync(m, ct);
        await repo.SalvarAsync(ct);
    }
}

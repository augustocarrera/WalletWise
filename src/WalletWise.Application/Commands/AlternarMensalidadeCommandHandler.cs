using MediatR;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class AlternarMensalidadeCommandHandler(IMensalidadeRepository repo) : IRequestHandler<AlternarMensalidadeCommand>
{
    public async Task Handle(AlternarMensalidadeCommand cmd, CancellationToken ct)
    {
        var m = await repo.ObterAsync(cmd.Id, ct) ?? throw new NotFoundException("Mensalidade não encontrada.");
        m.Alternar();
        await repo.SalvarAsync(ct);
    }
}

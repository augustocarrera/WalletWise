using MediatR;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;

namespace WalletWise.Application.Commands;

public class CriarMensalidadeCommandHandler(IMensalidadeRepository repo) : IRequestHandler<CriarMensalidadeCommand, Guid>
{
    public async Task<Guid> Handle(CriarMensalidadeCommand cmd, CancellationToken ct)
    {
        var m = Mensalidade.Criar(cmd.Nome, cmd.Valor, cmd.Moeda, cmd.DiaVencimento);
        await repo.AdicionarAsync(m, ct);
        await repo.SalvarAsync(ct);
        return m.Id;
    }
}

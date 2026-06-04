using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Queries;

public record ListarMensalidadesQuery : IRequest<IEnumerable<MensalidadeDto>>;

public class ListarMensalidadesQueryHandler(WalletWise.Application.Interfaces.IMensalidadeRepository repo)
    : IRequestHandler<ListarMensalidadesQuery, IEnumerable<MensalidadeDto>>
{
    public async Task<IEnumerable<MensalidadeDto>> Handle(ListarMensalidadesQuery _, CancellationToken ct)
    {
        var items = await repo.ListarAsync(ct);
        return items.Select(m => new MensalidadeDto(m.Id, m.Nome, m.Valor, m.Moeda, m.DiaVencimento, m.Ativa));
    }
}

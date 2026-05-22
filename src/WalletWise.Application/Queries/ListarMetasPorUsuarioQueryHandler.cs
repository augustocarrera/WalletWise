using MediatR;
using WalletWise.Application.Commands;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Queries;

public class ListarMetasQueryHandler(IMetaFinanceiraRepository repository)
    : IRequestHandler<ListarMetasQuery, List<MetaFinanceiraDto>>
{
    public async Task<List<MetaFinanceiraDto>> Handle(ListarMetasQuery request, CancellationToken cancellationToken)
    {
        var metas = await repository.GetAllAsync(cancellationToken);
        return metas.Select(CriarMetaFinanceiraCommandHandler.ToDto).ToList();
    }
}

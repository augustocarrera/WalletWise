using MediatR;
using WalletWise.Application.Commands;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Queries;

public class ListarTransacoesQueryHandler(ITransacaoRepository repository)
    : IRequestHandler<ListarTransacoesQuery, List<TransacaoDto>>
{
    public async Task<List<TransacaoDto>> Handle(ListarTransacoesQuery request, CancellationToken cancellationToken)
    {
        var transacoes = await repository.GetAllAsync(cancellationToken);
        return transacoes.Select(CriarTransacaoCommandHandler.ToDto).ToList();
    }
}

using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;

namespace WalletWise.Application.Commands;

public class CriarMetaFinanceiraCommandHandler(IMetaFinanceiraRepository repository)
    : IRequestHandler<CriarMetaFinanceiraCommand, MetaFinanceiraDto>
{
    public async Task<MetaFinanceiraDto> Handle(CriarMetaFinanceiraCommand request, CancellationToken cancellationToken)
    {
        var meta = MetaFinanceira.Criar(
            request.Nome, request.Descricao,
            request.ValorAlvo, request.DataAlvo, request.Moeda);

        await repository.AddAsync(meta, cancellationToken);
        return ToDto(meta);
    }

    internal static MetaFinanceiraDto ToDto(MetaFinanceira m) => new(
        m.Id, m.Nome, m.Descricao,
        m.ValorAlvo, m.ValorAcumulado, m.PercentualConcluido,
        m.Moeda, m.DataAlvo,
        Math.Max(0, (int)(m.DataAlvo - DateTime.UtcNow).TotalDays),
        m.Status.ToString());
}

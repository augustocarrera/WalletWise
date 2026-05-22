using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class AdicionarAporteMetaCommandHandler(IMetaFinanceiraRepository repository)
    : IRequestHandler<AdicionarAporteMetaCommand, MetaFinanceiraDto>
{
    public async Task<MetaFinanceiraDto> Handle(AdicionarAporteMetaCommand request, CancellationToken cancellationToken)
    {
        var meta = await repository.GetByIdAsync(request.MetaId, cancellationToken)
            ?? throw new NotFoundException($"Meta {request.MetaId} não encontrada.");

        meta.AdicionarAporte(request.Valor);
        await repository.UpdateAsync(meta, cancellationToken);
        return CriarMetaFinanceiraCommandHandler.ToDto(meta);
    }
}

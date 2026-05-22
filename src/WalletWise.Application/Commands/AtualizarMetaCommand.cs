using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public record AtualizarMetaCommand(
    Guid Id,
    string Nome,
    string Descricao,
    decimal ValorAlvo,
    DateTime DataAlvo
) : IRequest<MetaFinanceiraDto>;

public class AtualizarMetaCommandHandler(IMetaFinanceiraRepository repository)
    : IRequestHandler<AtualizarMetaCommand, MetaFinanceiraDto>
{
    public async Task<MetaFinanceiraDto> Handle(AtualizarMetaCommand request, CancellationToken cancellationToken)
    {
        var meta = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Meta {request.Id} não encontrada.");

        meta.Atualizar(request.Nome, request.Descricao, request.ValorAlvo, request.DataAlvo);
        await repository.UpdateAsync(meta, cancellationToken);
        return CriarMetaFinanceiraCommandHandler.ToDto(meta);
    }
}

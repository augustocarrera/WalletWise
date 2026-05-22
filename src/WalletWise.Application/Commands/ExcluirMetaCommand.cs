using MediatR;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public record ExcluirMetaCommand(Guid Id) : IRequest;

public class ExcluirMetaCommandHandler(IMetaFinanceiraRepository repository)
    : IRequestHandler<ExcluirMetaCommand>
{
    public async Task Handle(ExcluirMetaCommand request, CancellationToken cancellationToken)
    {
        var meta = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Meta {request.Id} não encontrada.");

        await repository.DeleteAsync(meta, cancellationToken);
    }
}

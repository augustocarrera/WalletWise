using MediatR;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class DeletarTransacaoCommandHandler(ITransacaoRepository repository)
    : IRequestHandler<DeletarTransacaoCommand, bool>
{
    public async Task<bool> Handle(DeletarTransacaoCommand request, CancellationToken cancellationToken)
    {
        var transacao = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Transação {request.Id} não encontrada.");

        await repository.DeleteAsync(transacao.Id, cancellationToken);
        return true;
    }
}

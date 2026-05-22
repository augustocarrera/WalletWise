using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Commands;

public class AtualizarTransacaoCommandHandler(
    ITransacaoRepository repository,
    ICotacaoService cotacaoService)
    : IRequestHandler<AtualizarTransacaoCommand, TransacaoDto>
{
    public async Task<TransacaoDto> Handle(AtualizarTransacaoCommand request, CancellationToken cancellationToken)
    {
        var transacao = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Transação {request.Id} não encontrada.");

        transacao.Atualizar(request.Descricao, request.Valor, request.Tipo, request.DataTransacao, request.Moeda);

        if (!request.Moeda.Equals("BRL", StringComparison.OrdinalIgnoreCase))
        {
            var cotacao = await cotacaoService.ObterCotacaoEmBrlAsync(request.Moeda, cancellationToken);
            transacao.AplicarConversao(request.Valor * cotacao, cotacao);
        }

        await repository.UpdateAsync(transacao, cancellationToken);
        return CriarTransacaoCommandHandler.ToDto(transacao);
    }
}

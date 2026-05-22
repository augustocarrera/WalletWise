using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;

namespace WalletWise.Application.Commands;

public class CriarTransacaoCommandHandler(
    ITransacaoRepository repository,
    ICotacaoService cotacaoService)
    : IRequestHandler<CriarTransacaoCommand, TransacaoDto>
{
    public async Task<TransacaoDto> Handle(CriarTransacaoCommand request, CancellationToken cancellationToken)
    {
        var transacao = Transacao.Criar(request.Descricao, request.Valor, request.Tipo, request.DataTransacao, request.Moeda);

        if (!request.Moeda.Equals("BRL", StringComparison.OrdinalIgnoreCase))
        {
            var cotacao = await cotacaoService.ObterCotacaoEmBrlAsync(request.Moeda, cancellationToken);
            transacao.AplicarConversao(request.Valor * cotacao, cotacao);
        }

        await repository.AddAsync(transacao, cancellationToken);
        return ToDto(transacao);
    }

    internal static TransacaoDto ToDto(Transacao t) => new(
        t.Id, t.Descricao, t.Valor, t.Moeda,
        t.ValorEmBrl, t.CotacaoUsada,
        t.Tipo.ToString(), t.DataTransacao, t.DataCriacao);
}

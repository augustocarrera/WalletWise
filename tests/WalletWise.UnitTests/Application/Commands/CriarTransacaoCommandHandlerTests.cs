using FluentAssertions;
using NSubstitute;
using WalletWise.Application.Commands;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Enums;

namespace WalletWise.UnitTests.Application.Commands;

public class CriarTransacaoCommandHandlerTests
{
    private readonly ITransacaoRepository _transacaoRepository = Substitute.For<ITransacaoRepository>();
    private readonly ICotacaoService _cotacaoService = Substitute.For<ICotacaoService>();
    private readonly CriarTransacaoCommandHandler _handler;

    public CriarTransacaoCommandHandlerTests()
    {
        _handler = new CriarTransacaoCommandHandler(_transacaoRepository, _cotacaoService);
    }

    [Fact]
    public async Task Handle_TransacaoEmBRL_NaoDeveChamarCotacaoService()
    {
        var comando = new CriarTransacaoCommand("Supermercado", 250m, TipoTransacao.Despesa, DateTime.Today, "BRL");

        var resultado = await _handler.Handle(comando, CancellationToken.None);

        resultado.Moeda.Should().Be("BRL");
        resultado.ValorEmBrl.Should().BeNull();
        await _cotacaoService.DidNotReceive()
            .ObterCotacaoEmBrlAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_TransacaoEmMoedaEstrangeira_DeveChamarCotacaoEConverterValor()
    {
        _cotacaoService.ObterCotacaoEmBrlAsync("USD", Arg.Any<CancellationToken>()).Returns(5.09m);

        var comando = new CriarTransacaoCommand("Netflix", 15.99m, TipoTransacao.Despesa, DateTime.Today, "USD");

        var resultado = await _handler.Handle(comando, CancellationToken.None);

        resultado.Moeda.Should().Be("USD");
        resultado.ValorEmBrl.Should().Be(15.99m * 5.09m);
        resultado.CotacaoUsada.Should().Be(5.09m);
        await _cotacaoService.Received(1)
            .ObterCotacaoEmBrlAsync("USD", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_TransacaoValida_DeveSalvarNoRepositorio()
    {
        var comando = new CriarTransacaoCommand("Almoço", 45m, TipoTransacao.Despesa, DateTime.Today);

        await _handler.Handle(comando, CancellationToken.None);

        await _transacaoRepository.Received(1)
            .AddAsync(Arg.Any<WalletWise.Domain.Entities.Transacao>(), Arg.Any<CancellationToken>());
    }
}

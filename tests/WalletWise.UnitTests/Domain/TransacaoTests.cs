using FluentAssertions;
using WalletWise.Domain.Entities;
using WalletWise.Domain.Enums;

namespace WalletWise.UnitTests.Domain;

public class TransacaoTests
{
    [Fact]
    public void Criar_DeveRetornarTransacaoComCamposPreenchidos()
    {
        var transacao = Transacao.Criar("Salário", 5000m, TipoTransacao.Receita, DateTime.Today);

        transacao.Id.Should().NotBeEmpty();
        transacao.Descricao.Should().Be("Salário");
        transacao.Valor.Should().Be(5000m);
        transacao.Tipo.Should().Be(TipoTransacao.Receita);
        transacao.Moeda.Should().Be("BRL");
        transacao.DataCriacao.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(3));
    }

    [Theory]
    [InlineData("brl", "BRL")]
    [InlineData("usd", "USD")]
    [InlineData("Eur", "EUR")]
    public void Criar_DeveSalvarMoedaSempreEmMaiusculo(string moedaInput, string moedaEsperada)
    {
        var transacao = Transacao.Criar("Compra", 100m, TipoTransacao.Despesa, DateTime.Today, moedaInput);

        transacao.Moeda.Should().Be(moedaEsperada);
    }

    [Fact]
    public void Criar_SemInformarMoeda_DevePadronizarParaBRL()
    {
        var transacao = Transacao.Criar("Mercado", 250m, TipoTransacao.Despesa, DateTime.Today);

        transacao.Moeda.Should().Be("BRL");
        transacao.ValorEmBrl.Should().BeNull();
        transacao.CotacaoUsada.Should().BeNull();
    }

    [Fact]
    public void AplicarConversao_DevePreencherValorEmBrlECotacao()
    {
        var transacao = Transacao.Criar("Netflix", 15.99m, TipoTransacao.Despesa, DateTime.Today, "USD");

        transacao.AplicarConversao(81.39m, 5.09m);

        transacao.ValorEmBrl.Should().Be(81.39m);
        transacao.CotacaoUsada.Should().Be(5.09m);
        transacao.DataAtualizacao.Should().NotBeNull();
        transacao.DataAtualizacao.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(3));
    }

    [Fact]
    public void AplicarConversao_NaoDeveAlterarValorOriginal()
    {
        var transacao = Transacao.Criar("Spotify", 9.99m, TipoTransacao.Despesa, DateTime.Today, "USD");

        transacao.AplicarConversao(50.85m, 5.09m);

        transacao.Valor.Should().Be(9.99m);
        transacao.Moeda.Should().Be("USD");
    }

    [Fact]
    public void Atualizar_DeveAlterarCamposEResetarConversao()
    {
        var transacao = Transacao.Criar("Compra", 100m, TipoTransacao.Despesa, DateTime.Today, "USD");
        transacao.AplicarConversao(500m, 5m);

        transacao.Atualizar("Compra Editada", 200m, TipoTransacao.Receita, DateTime.Today.AddDays(-1), "BRL");

        transacao.Descricao.Should().Be("Compra Editada");
        transacao.Valor.Should().Be(200m);
        transacao.Tipo.Should().Be(TipoTransacao.Receita);
        transacao.Moeda.Should().Be("BRL");
        transacao.ValorEmBrl.Should().BeNull();
        transacao.CotacaoUsada.Should().BeNull();
        transacao.DataAtualizacao.Should().NotBeNull();
    }

    [Fact]
    public void Criar_DeveTerIdUnicoACadaChamada()
    {
        var t1 = Transacao.Criar("A", 1m, TipoTransacao.Receita, DateTime.Today);
        var t2 = Transacao.Criar("B", 1m, TipoTransacao.Receita, DateTime.Today);

        t1.Id.Should().NotBe(t2.Id);
    }
}

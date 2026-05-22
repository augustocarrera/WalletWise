using FluentAssertions;
using WalletWise.Domain.Entities;
using WalletWise.Domain.Enums;

namespace WalletWise.UnitTests.Domain;

public class MetaFinanceiraTests
{
    private static readonly DateTime DataAlvo = DateTime.UtcNow.AddMonths(6);

    [Fact]
    public void Criar_DeveIniciarComStatusEmAndamento()
    {
        var meta = MetaFinanceira.Criar("Viagem ao Japão", "Economizar para Tokyo", 15000m, DataAlvo);

        meta.Status.Should().Be(StatusMeta.EmAndamento);
        meta.ValorAcumulado.Should().Be(0);
        meta.PercentualConcluido.Should().Be(0);
    }

    [Fact]
    public void AdicionarAporte_DeveAcumularCorretamente()
    {
        var meta = MetaFinanceira.Criar("Japão", "", 10000m, DataAlvo);

        meta.AdicionarAporte(3000m);
        meta.AdicionarAporte(2000m);

        meta.ValorAcumulado.Should().Be(5000m);
        meta.Status.Should().Be(StatusMeta.EmAndamento);
    }

    [Fact]
    public void AdicionarAporte_QuandoAtingeOuUltrapassaValorAlvo_DeveConcluirMeta()
    {
        var meta = MetaFinanceira.Criar("iPhone", "", 6000m, DataAlvo);

        meta.AdicionarAporte(4000m);
        meta.AdicionarAporte(2500m);

        meta.Status.Should().Be(StatusMeta.Concluida);
        meta.ValorAcumulado.Should().Be(6500m);
    }

    [Fact]
    public void PercentualConcluido_DeveCalcularProporcionalmente()
    {
        var meta = MetaFinanceira.Criar("Europa", "", 10000m, DataAlvo);

        meta.AdicionarAporte(2500m);

        meta.PercentualConcluido.Should().Be(25m);
    }

    [Fact]
    public void PercentualConcluido_NuncaDeveUltrapassar100()
    {
        var meta = MetaFinanceira.Criar("Mochila", "", 1000m, DataAlvo);

        meta.AdicionarAporte(1500m);

        meta.PercentualConcluido.Should().Be(100m);
    }

    [Fact]
    public void Cancelar_DeveAlterarStatusParaCancelada()
    {
        var meta = MetaFinanceira.Criar("Carro", "", 50000m, DataAlvo);

        meta.Cancelar();

        meta.Status.Should().Be(StatusMeta.Cancelada);
        meta.DataAtualizacao.Should().NotBeNull();
    }

    [Fact]
    public void AdicionarAporte_DeveAtualizarDataAtualizacao()
    {
        var meta = MetaFinanceira.Criar("Viagem", "", 5000m, DataAlvo);

        meta.AdicionarAporte(100m);

        meta.DataAtualizacao.Should().NotBeNull();
        meta.DataAtualizacao.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(3));
    }

    [Fact]
    public void Criar_DevePadronizarMoedaParaBRL()
    {
        var meta = MetaFinanceira.Criar("NY", "", 10000m, DataAlvo, "usd");

        meta.Moeda.Should().Be("USD");
    }
}

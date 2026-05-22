using FluentAssertions;
using NSubstitute;
using WalletWise.Application.Commands;
using WalletWise.Application.Exceptions;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;

namespace WalletWise.UnitTests.Application.Commands;

public class AdicionarAporteMetaCommandHandlerTests
{
    private readonly IMetaFinanceiraRepository _repository = Substitute.For<IMetaFinanceiraRepository>();
    private readonly AdicionarAporteMetaCommandHandler _handler;

    public AdicionarAporteMetaCommandHandlerTests()
    {
        _handler = new AdicionarAporteMetaCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_MetaNaoEncontrada_DeveLancarNotFoundException()
    {
        var metaId = Guid.NewGuid();
        _repository.GetByIdAsync(metaId, Arg.Any<CancellationToken>()).Returns((MetaFinanceira?)null);

        var acao = () => _handler.Handle(new AdicionarAporteMetaCommand(metaId, 500m), CancellationToken.None);

        await acao.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{metaId}*");
    }

    [Fact]
    public async Task Handle_MetaEncontrada_DeveAdicionarAporteESalvar()
    {
        var meta = MetaFinanceira.Criar("Viagem", "", 10000m, DateTime.UtcNow.AddMonths(6));
        _repository.GetByIdAsync(meta.Id, Arg.Any<CancellationToken>()).Returns(meta);

        var resultado = await _handler.Handle(new AdicionarAporteMetaCommand(meta.Id, 3000m), CancellationToken.None);

        resultado.ValorAcumulado.Should().Be(3000m);
        resultado.PercentualConcluido.Should().Be(30m);
        await _repository.Received(1).UpdateAsync(meta, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AporteQueCompletaMeta_DeveRetornarStatusConcluida()
    {
        var meta = MetaFinanceira.Criar("iPhone", "", 6000m, DateTime.UtcNow.AddMonths(3));
        _repository.GetByIdAsync(meta.Id, Arg.Any<CancellationToken>()).Returns(meta);

        var resultado = await _handler.Handle(new AdicionarAporteMetaCommand(meta.Id, 6000m), CancellationToken.None);

        resultado.Status.Should().Be("Concluida");
        resultado.PercentualConcluido.Should().Be(100m);
    }
}

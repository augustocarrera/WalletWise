using FluentValidation.TestHelper;
using WalletWise.Application.Commands;
using WalletWise.Domain.Enums;

namespace WalletWise.UnitTests.Application.Validators;

public class CriarTransacaoCommandValidatorTests
{
    private readonly CriarTransacaoCommandValidator _validator = new();

    private static CriarTransacaoCommand ComandoValido() => new(
        Descricao: "Salário mensal",
        Valor: 5000m,
        Tipo: TipoTransacao.Receita,
        DataTransacao: DateTime.Today,
        Moeda: "BRL");

    [Fact]
    public void Comando_Valido_NaoDeveRetornarErros()
    {
        var resultado = _validator.TestValidate(ComandoValido());

        resultado.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Descricao_VaziaOuEspacos_DeveRetornarErro(string descricao)
    {
        var comando = ComandoValido() with { Descricao = descricao };
        var resultado = _validator.TestValidate(comando);

        resultado.ShouldHaveValidationErrorFor(x => x.Descricao);
    }

    [Fact]
    public void Descricao_ComMaisDe200Caracteres_DeveRetornarErro()
    {
        var comando = ComandoValido() with { Descricao = new string('x', 201) };
        var resultado = _validator.TestValidate(comando);

        resultado.ShouldHaveValidationErrorFor(x => x.Descricao);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-999.99)]
    public void Valor_ZeroOuNegativo_DeveRetornarErro(decimal valor)
    {
        var comando = ComandoValido() with { Valor = valor };
        var resultado = _validator.TestValidate(comando);

        resultado.ShouldHaveValidationErrorFor(x => x.Valor);
    }

    [Theory]
    [InlineData("BRL")]
    [InlineData("USD")]
    [InlineData("EUR")]
    [InlineData("GBP")]
    [InlineData("ARS")]
    [InlineData("JPY")]
    public void Moeda_Suportada_NaoDeveRetornarErro(string moeda)
    {
        var comando = ComandoValido() with { Moeda = moeda };
        var resultado = _validator.TestValidate(comando);

        resultado.ShouldNotHaveValidationErrorFor(x => x.Moeda);
    }

    [Theory]
    [InlineData("BTC")]
    [InlineData("XYZ")]
    [InlineData("")]
    public void Moeda_NaoSuportada_DeveRetornarErro(string moeda)
    {
        var comando = ComandoValido() with { Moeda = moeda };
        var resultado = _validator.TestValidate(comando);

        resultado.ShouldHaveValidationErrorFor(x => x.Moeda);
    }
}

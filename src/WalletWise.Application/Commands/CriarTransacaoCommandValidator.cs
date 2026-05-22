using FluentValidation;

namespace WalletWise.Application.Commands;

public class CriarTransacaoCommandValidator : AbstractValidator<CriarTransacaoCommand>
{
    private static readonly HashSet<string> MoedasSuportadas = ["BRL", "USD", "EUR", "GBP", "ARS", "JPY"];

    public CriarTransacaoCommandValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(200).WithMessage("Descrição deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero.");

        RuleFor(x => x.DataTransacao)
            .NotEmpty().WithMessage("Data da transação é obrigatória.");

        RuleFor(x => x.Moeda)
            .NotEmpty()
            .Must(m => MoedasSuportadas.Contains(m.ToUpperInvariant()))
            .WithMessage($"Moeda inválida. Suportadas: {string.Join(", ", MoedasSuportadas)}.");
    }
}

namespace WalletWise.Domain.Entities;

public class Mensalidade
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public decimal Valor { get; private set; }
    public string Moeda { get; private set; } = "BRL";
    public int DiaVencimento { get; private set; }
    public bool Ativa { get; private set; }
    public DateTime DataCriacao { get; private set; }
    public DateTime? DataAtualizacao { get; private set; }

    private Mensalidade() { }

    public static Mensalidade Criar(string nome, decimal valor, string moeda, int diaVencimento)
    {
        return new Mensalidade
        {
            Id = Guid.NewGuid(),
            Nome = nome,
            Valor = valor,
            Moeda = moeda.ToUpperInvariant(),
            DiaVencimento = Math.Clamp(diaVencimento, 1, 28),
            Ativa = true,
            DataCriacao = DateTime.UtcNow
        };
    }

    public void Atualizar(string nome, decimal valor, string moeda, int diaVencimento)
    {
        Nome = nome;
        Valor = valor;
        Moeda = moeda.ToUpperInvariant();
        DiaVencimento = Math.Clamp(diaVencimento, 1, 28);
        DataAtualizacao = DateTime.UtcNow;
    }

    public void Alternar()
    {
        Ativa = !Ativa;
        DataAtualizacao = DateTime.UtcNow;
    }
}

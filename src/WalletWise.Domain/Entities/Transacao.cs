using WalletWise.Domain.Enums;

namespace WalletWise.Domain.Entities;

public class Transacao
{
    public Guid Id { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public decimal Valor { get; private set; }
    public string Moeda { get; private set; } = "BRL";
    public decimal? ValorEmBrl { get; private set; }
    public decimal? CotacaoUsada { get; private set; }
    public TipoTransacao Tipo { get; private set; }
    public DateTime DataTransacao { get; private set; }
    public DateTime DataCriacao { get; private set; }
    public DateTime? DataAtualizacao { get; private set; }

    private Transacao() { }

    public static Transacao Criar(
        string descricao,
        decimal valor,
        TipoTransacao tipo,
        DateTime dataTransacao,
        string moeda = "BRL")
    {
        return new Transacao
        {
            Id = Guid.NewGuid(),
            Descricao = descricao,
            Valor = valor,
            Tipo = tipo,
            Moeda = moeda.ToUpperInvariant(),
            DataTransacao = DateTime.SpecifyKind(dataTransacao, DateTimeKind.Utc),
            DataCriacao = DateTime.UtcNow
        };
    }

    public void Atualizar(string descricao, decimal valor, TipoTransacao tipo, DateTime dataTransacao, string moeda)
    {
        Descricao = descricao;
        Valor = valor;
        Tipo = tipo;
        DataTransacao = DateTime.SpecifyKind(dataTransacao, DateTimeKind.Utc);
        Moeda = moeda.ToUpperInvariant();
        ValorEmBrl = null;
        CotacaoUsada = null;
        DataAtualizacao = DateTime.UtcNow;
    }

    public void AplicarConversao(decimal valorEmBrl, decimal cotacao)
    {
        ValorEmBrl = valorEmBrl;
        CotacaoUsada = cotacao;
        DataAtualizacao = DateTime.UtcNow;
    }
}

using WalletWise.Domain.Enums;

namespace WalletWise.Domain.Entities;

public class MetaFinanceira
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Descricao { get; private set; } = string.Empty;
    public decimal ValorAlvo { get; private set; }
    public decimal ValorAcumulado { get; private set; }
    public string Moeda { get; private set; } = "BRL";
    public DateTime DataAlvo { get; private set; }
    public StatusMeta Status { get; private set; }
    public DateTime DataCriacao { get; private set; }
    public DateTime? DataAtualizacao { get; private set; }

    public decimal PercentualConcluido =>
        ValorAlvo == 0 ? 0 : Math.Min(ValorAcumulado / ValorAlvo * 100, 100);

    private MetaFinanceira() { }

    public static MetaFinanceira Criar(string nome, string descricao, decimal valorAlvo, DateTime dataAlvo, string moeda = "BRL")
    {
        return new MetaFinanceira
        {
            Id = Guid.NewGuid(),
            Nome = nome,
            Descricao = descricao,
            ValorAlvo = valorAlvo,
            ValorAcumulado = 0,
            Moeda = moeda.ToUpperInvariant(),
            DataAlvo = DateTime.SpecifyKind(dataAlvo, DateTimeKind.Utc),
            Status = StatusMeta.EmAndamento,
            DataCriacao = DateTime.UtcNow
        };
    }

    public void AdicionarAporte(decimal valor)
    {
        ValorAcumulado += valor;
        DataAtualizacao = DateTime.UtcNow;

        if (ValorAcumulado >= ValorAlvo)
            Status = StatusMeta.Concluida;
    }

    public void Atualizar(string nome, string descricao, decimal valorAlvo, DateTime dataAlvo)
    {
        Nome = nome;
        Descricao = descricao;
        ValorAlvo = valorAlvo;
        DataAlvo = DateTime.SpecifyKind(dataAlvo, DateTimeKind.Utc);
        DataAtualizacao = DateTime.UtcNow;

        if (ValorAcumulado >= ValorAlvo)
            Status = StatusMeta.Concluida;
        else if (Status == StatusMeta.Concluida)
            Status = StatusMeta.EmAndamento;
    }

    public void Cancelar()
    {
        Status = StatusMeta.Cancelada;
        DataAtualizacao = DateTime.UtcNow;
    }
}

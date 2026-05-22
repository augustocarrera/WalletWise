namespace WalletWise.Web.Exceptions;

public record ApiError(int Status, string Mensagem, string Caminho)
{
    public DateTime Timestamp { get; } = DateTime.UtcNow;
}

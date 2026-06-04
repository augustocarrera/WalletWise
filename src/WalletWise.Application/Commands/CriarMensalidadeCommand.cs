using MediatR;

namespace WalletWise.Application.Commands;

public record CriarMensalidadeCommand(string Nome, decimal Valor, string Moeda, int DiaVencimento) : IRequest<Guid>;

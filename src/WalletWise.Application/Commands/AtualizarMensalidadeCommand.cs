using MediatR;

namespace WalletWise.Application.Commands;

public record AtualizarMensalidadeCommand(Guid Id, string Nome, decimal Valor, string Moeda, int DiaVencimento) : IRequest;

using MediatR;

namespace WalletWise.Application.Commands;

public record ExcluirMensalidadeCommand(Guid Id) : IRequest;

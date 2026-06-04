using MediatR;

namespace WalletWise.Application.Commands;

public record AlternarMensalidadeCommand(Guid Id) : IRequest;

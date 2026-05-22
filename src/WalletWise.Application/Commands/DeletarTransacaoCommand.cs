using MediatR;

namespace WalletWise.Application.Commands;

public record DeletarTransacaoCommand(Guid Id) : IRequest<bool>;

using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Queries;

public record ListarTransacoesQuery : IRequest<List<TransacaoDto>>;

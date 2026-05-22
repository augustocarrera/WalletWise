using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Queries;

public record ResumoMensalQuery(int Ano, int Mes) : IRequest<ResumoMensalDto>;

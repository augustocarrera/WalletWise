using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;

namespace WalletWise.Application.Queries;

public class ResumoMensalQueryHandler(IRelatorioRepository repository)
    : IRequestHandler<ResumoMensalQuery, ResumoMensalDto>
{
    public Task<ResumoMensalDto> Handle(ResumoMensalQuery request, CancellationToken cancellationToken)
        => repository.ObterResumoMensalAsync(request.Ano, request.Mes, cancellationToken);
}

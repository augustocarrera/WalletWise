using Microsoft.EntityFrameworkCore;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Enums;
using WalletWise.Infrastructure.Persistence;

namespace WalletWise.Infrastructure.Repositories;

public class RelatorioRepository(AppDbContext context) : IRelatorioRepository
{
    public async Task<ResumoMensalDto> ObterResumoMensalAsync(
        int ano, int mes, CancellationToken cancellationToken = default)
    {
        var transacoes = await context.Transacoes
            .Where(t => t.DataTransacao.Year == ano && t.DataTransacao.Month == mes)
            .ToListAsync(cancellationToken);

        var totalReceitas = transacoes
            .Where(t => t.Tipo == TipoTransacao.Receita)
            .Sum(t => t.ValorEmBrl ?? t.Valor);

        var totalDespesas = transacoes
            .Where(t => t.Tipo == TipoTransacao.Despesa)
            .Sum(t => t.ValorEmBrl ?? t.Valor);

        return new ResumoMensalDto(ano, mes, totalReceitas, totalDespesas, totalReceitas - totalDespesas, transacoes.Count);
    }
}

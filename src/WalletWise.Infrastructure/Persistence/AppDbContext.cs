using Microsoft.EntityFrameworkCore;
using WalletWise.Domain.Entities;

namespace WalletWise.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<MetaFinanceira> MetasFinanceiras => Set<MetaFinanceira>();
    public DbSet<Mensalidade> Mensalidades => Set<Mensalidade>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

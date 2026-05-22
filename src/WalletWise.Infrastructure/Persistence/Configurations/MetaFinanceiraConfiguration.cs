using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletWise.Domain.Entities;

namespace WalletWise.Infrastructure.Persistence.Configurations;

public class MetaFinanceiraConfiguration : IEntityTypeConfiguration<MetaFinanceira>
{
    public void Configure(EntityTypeBuilder<MetaFinanceira> builder)
    {
        builder.ToTable("metas_financeiras");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedNever();
        builder.Property(m => m.Nome).IsRequired().HasMaxLength(150);
        builder.Property(m => m.Descricao).HasMaxLength(500);
        builder.Property(m => m.ValorAlvo).IsRequired().HasColumnType("numeric(18,4)");
        builder.Property(m => m.ValorAcumulado).IsRequired().HasColumnType("numeric(18,4)");
        builder.Property(m => m.Moeda).IsRequired().HasMaxLength(3);
        builder.Property(m => m.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Ignore(m => m.PercentualConcluido);
    }
}

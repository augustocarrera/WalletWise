using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletWise.Domain.Entities;

namespace WalletWise.Infrastructure.Persistence.Configurations;

public class TransacaoConfiguration : IEntityTypeConfiguration<Transacao>
{
    public void Configure(EntityTypeBuilder<Transacao> builder)
    {
        builder.ToTable("transacoes");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Descricao).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Valor).IsRequired().HasColumnType("numeric(18,4)");
        builder.Property(t => t.Moeda).IsRequired().HasMaxLength(3);
        builder.Property(t => t.ValorEmBrl).HasColumnType("numeric(18,4)");
        builder.Property(t => t.CotacaoUsada).HasColumnType("numeric(18,6)");
        builder.Property(t => t.Tipo).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.DataTransacao).IsRequired();
        builder.Property(t => t.DataCriacao).IsRequired();
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletWise.Domain.Entities;

namespace WalletWise.Infrastructure.Persistence.Configurations;

public class MensalidadeConfiguration : IEntityTypeConfiguration<Mensalidade>
{
    public void Configure(EntityTypeBuilder<Mensalidade> b)
    {
        b.HasKey(m => m.Id);
        b.Property(m => m.Nome).IsRequired().HasMaxLength(200);
        b.Property(m => m.Valor).HasPrecision(18, 4);
        b.Property(m => m.Moeda).IsRequired().HasMaxLength(10);
        b.Property(m => m.DiaVencimento).IsRequired();
        b.Property(m => m.Ativa).IsRequired();
    }
}

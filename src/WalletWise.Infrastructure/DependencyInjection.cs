using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WalletWise.Application.Interfaces;
using WalletWise.Infrastructure.ExternalServices;
using WalletWise.Infrastructure.Persistence;
using WalletWise.Infrastructure.Repositories;

namespace WalletWise.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ITransacaoRepository, TransacaoRepository>();
        services.AddScoped<IMetaFinanceiraRepository, MetaFinanceiraRepository>();
        services.AddScoped<IRelatorioRepository, RelatorioRepository>();

        services.AddHttpClient<ICotacaoService, CotacaoService>(client =>
        {
            client.BaseAddress = new Uri("https://economia.awesomeapi.com.br/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        services.AddHttpClient<IAnaliseCambioService, AnaliseCambioService>(client =>
        {
            client.BaseAddress = new Uri("https://economia.awesomeapi.com.br/");
            client.Timeout = TimeSpan.FromSeconds(15);
        });

        return services;
    }
}

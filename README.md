# WalletWise — Agregador de Finanças Pessoais

Aplicação full-stack de finanças pessoais desenvolvida com C# (.NET 8) e React, focada no gerenciamento de transações em múltiplas moedas, planejamento de metas de viagem e monitoramento de câmbio em tempo real.

## Sobre o Projeto

O WalletWise ajuda o usuário a organizar receitas e despesas em diferentes moedas. Transações em moeda estrangeira são automaticamente convertidas para BRL usando a cotação do momento. O módulo de metas de viagem permite planejar viagens internacionais acompanhando o progresso da poupança e identificando o melhor momento para comprar a moeda desejada.

## Funcionalidades

- **Transações:** CRUD completo com suporte a múltiplas moedas. Transações em moeda estrangeira persistem o valor original, o equivalente em BRL e a cotação utilizada
- **Dashboard:** Resumo mensal com total de receitas, despesas, saldo e quantidade de transações. Exibe a meta de viagem ativa com progresso e sugestão de poupança mensal
- **Metas de Viagem:** Criação de metas com seletor de 46 moedas. O valor alvo pode ser inserido na moeda local ou em reais — a conversão é feita automaticamente. Cada meta exibe gráfico de 30 dias e recomendação de compra com base no desvio em relação à média do período (dados via AwesomeAPI, cache de 10 minutos)

## Stack Tecnológica

**Backend**
- .NET 8, C# 12, ASP.NET Core Web API
- Clean Architecture — Domain / Application / Infrastructure / Web
- CQRS com MediatR 14; cada caso de uso é um Command ou Query isolado
- FluentValidation 12 integrado ao pipeline do MediatR
- Entity Framework Core 8 com Fluent API (Code First)
- PostgreSQL 16
- Docker + Docker Compose

**Frontend**
- React 18, Vite 5
- Tailwind CSS 3 com CSS variables para tema claro/escuro
- React Router 6, Context API

**API Externa**
- [AwesomeAPI](https://docs.awesomeapi.com.br) — cotações em tempo real e histórico de 30 dias

## Estrutura do Projeto

```
WalletWise/
├── Dockerfile
├── docker-compose.yml
├── WalletWise.sln
├── start.bat / start.ps1             ← Windows: sobe tudo com um clique
│
├── src/
│   ├── WalletWise.Domain/            ← Entidades, enums e regras de negócio
│   ├── WalletWise.Application/       ← Commands, Queries, DTOs, Interfaces
│   ├── WalletWise.Infrastructure/    ← EF Core, repositórios, HttpClients
│   ├── WalletWise.Web/               ← Controllers, Swagger, DI, tratamento de erros
│   └── WalletWise.Frontend/          ← SPA React (Vite + Tailwind CSS)
│
└── tests/
    └── WalletWise.UnitTests/         ← xUnit, NSubstitute, FluentAssertions
```

## Como Executar

**Docker (Recomendado)** — necessário apenas o [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
docker compose up --build
```

| Serviço  | URL                           |
|----------|-------------------------------|
| Frontend | http://localhost:5173         |
| API      | http://localhost:5191         |
| Swagger  | http://localhost:5191/swagger |

**Windows (desenvolvimento local)** — necessário .NET 8 SDK, Node.js 18+ e Docker para o banco:

```
start.bat
```

**Manual:**

```bash
# terminal 1
docker compose up -d db
dotnet run --project src/WalletWise.Web

# terminal 2
cd src/WalletWise.Frontend && npm install && npm run dev
```

## Endpoints da API

**Transações**
- `GET /api/transacoes` — lista todas as transações
- `POST /api/transacoes` — cria; converte automaticamente para BRL se moeda estrangeira
- `PUT /api/transacoes/{id}` — atualiza; recalcula a conversão
- `DELETE /api/transacoes/{id}` — remove

**Metas de Viagem**
- `GET /api/metas` — lista todas as metas
- `POST /api/metas` — cria uma meta
- `PUT /api/metas/{id}` — atualiza uma meta
- `DELETE /api/metas/{id}` — remove uma meta
- `PATCH /api/metas/{id}/aporte` — adiciona aporte a uma meta

**Relatórios e Câmbio**
- `GET /api/relatorios/resumo-mensal?ano=2026&mes=5` — resumo financeiro do mês
- `GET /api/analise-cambio/{moeda}` — análise de 30 dias e recomendação de compra

## Testes

```bash
dotnet test
```

Cobertura unitária: comportamento de domínio de `Transacao` e `MetaFinanceira`, `CriarTransacaoCommandHandler` (fluxo BRL e moeda estrangeira), `AdicionarAporteMetaCommandHandler` e `CriarTransacaoCommandValidator`.

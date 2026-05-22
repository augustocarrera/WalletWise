# Estágio 1: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY WalletWise.sln .
COPY src/WalletWise.Domain/WalletWise.Domain.csproj             src/WalletWise.Domain/
COPY src/WalletWise.Application/WalletWise.Application.csproj   src/WalletWise.Application/
COPY src/WalletWise.Infrastructure/WalletWise.Infrastructure.csproj src/WalletWise.Infrastructure/
COPY src/WalletWise.Web/WalletWise.Web.csproj                   src/WalletWise.Web/

RUN dotnet restore

COPY . .
RUN dotnet publish src/WalletWise.Web/WalletWise.Web.csproj -c Release -o /app/publish

# Estágio 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WalletWise.Web.dll"]

# WalletWise - Script de inicializacao completa
# Resolve o problema do '#' no path criando um junction point em C:\ww

$root         = $PSScriptRoot
$apiPath      = Join-Path $root "src\WalletWise.Web"
$frontendReal = Join-Path $root "src\WalletWise.Frontend"
$junction     = "C:\ww"   # path limpo, sem '#', para o Vite funcionar

function Write-Step($n, $msg) {
    Write-Host ""
    Write-Host "  [$n/4] $msg" -ForegroundColor Yellow
}
function Write-Ok($msg) {
    Write-Host "        $msg" -ForegroundColor Green
}

# ── Banner ────────────────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   WalletWise - Global Finance" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Junction C:\ww → frontend (resolve bug do '#' no path do Vite) ─
Write-Step 1 "Criando atalho de path para o Vite (C:\ww)..."

# Remove junction anterior se existir (rmdir nao apaga os arquivos reais)
if (Test-Path $junction) {
    cmd /c "rmdir `"$junction`"" > $null 2>&1
}
$result = cmd /c "mklink /J `"$junction`" `"$frontendReal`"" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Ok "Junction criado: C:\ww -> $frontendReal"
} else {
    Write-Host "        Aviso: nao foi possivel criar o junction ($result)." -ForegroundColor DarkYellow
    Write-Host "        Tente executar como Administrador se a tela ficar branca." -ForegroundColor DarkYellow
    $junction = $frontendReal  # fallback para o path original
}

# ── 2. Banco de dados via Docker ──────────────────────────────────────
Write-Step 2 "Iniciando banco de dados PostgreSQL (Docker)..."

if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose -f "$root\docker-compose.yml" up -d db 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "PostgreSQL iniciado em localhost:5432"
        $tries = 0
        do {
            Start-Sleep -Seconds 2
            $ready = docker exec walletwise_db pg_isready -U postgres 2>$null
            $tries++
        } while ($ready -notmatch "accepting" -and $tries -lt 10)
        Write-Ok "Banco pronto para conexoes."
    } else {
        Write-Host "        Docker nao encontrado ou erro. Assumindo PostgreSQL ja ativo." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "        Docker nao encontrado. Assumindo PostgreSQL ja rodando localmente." -ForegroundColor DarkYellow
}

# ── 3. API .NET ───────────────────────────────────────────────────────
Write-Step 3 "Iniciando API .NET 8 (http://localhost:5191)..."

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'WalletWise - API'; Set-Location '$apiPath'; dotnet run"
) -WindowStyle Normal

Write-Ok "API iniciando..."
Start-Sleep -Seconds 5

# ── 4. Frontend React via junction C:\ww ──────────────────────────────
Write-Step 4 "Iniciando frontend React via C:\ww (http://localhost:5173)..."

# Instala dependencias se necessario
$nodeModules = Join-Path $junction "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "        Instalando dependencias npm (primeira vez)..." -ForegroundColor DarkYellow
    Start-Process powershell -ArgumentList @(
        "-Command", "Set-Location '$junction'; npm install"
    ) -Wait -WindowStyle Hidden
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$host.UI.RawUI.WindowTitle = 'WalletWise - Frontend'; Set-Location '$junction'; npm run dev"
) -WindowStyle Normal

Write-Ok "Frontend iniciando via path limpo (sem '#')..."
Start-Sleep -Seconds 4

# ── Abre o navegador ──────────────────────────────────────────────────
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   Tudo pronto!" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "   API      : http://localhost:5191" -ForegroundColor White
Write-Host "   Swagger  : http://localhost:5191/swagger" -ForegroundColor White
Write-Host ""
Write-Host "   Para parar: feche as janelas da API e do Frontend." -ForegroundColor DarkGray
Write-Host ""

Start-Process "http://localhost:5173"

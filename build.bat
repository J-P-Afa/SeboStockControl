@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

REM ============================================================
REM  SeboStockControl — Script de build e inicialização (Windows)
REM  Uso: build.bat
REM
REM  O que este script faz:
REM    1. Para containers Docker que estiverem rodando
REM    2. Sobe o banco de dados PostgreSQL via Docker
REM    3. Instala dependências do backend e frontend
REM    4. Cria o arquivo .env se não existir
REM    5. Roda as migrations e seed do banco
REM    6. Inicia backend e frontend
REM
REM  Para parar depois: feche as janelas do terminal
REM ============================================================

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

REM ---------------------- verificações -------------------------
where docker >nul 2>&1 || (
    echo [ERRO] Docker nao encontrado. Instale em https://docs.docker.com/get-docker/
    pause
    exit /b 1
)
where node >nul 2>&1 || (
    echo [ERRO] Node.js nao encontrado. Instale a versao 20+ em https://nodejs.org
    pause
    exit /b 1
)
where npm >nul 2>&1 || (
    echo [ERRO] npm nao encontrado. Ele vem junto com o Node.js.
    pause
    exit /b 1
)

REM ---------------------- 1. Docker ----------------------------
echo.
echo [1/7] Parando containers anteriores...
docker compose down 2>nul
echo       Containers parados.

echo.
echo [2/7] Subindo banco de dados PostgreSQL...
docker compose up -d
echo       PostgreSQL rodando na porta 5432.

echo.
echo [2/7] Aguardando PostgreSQL ficar pronto...
set READY=0
for /l %%i in (1,1,30) do (
    if !READY! equ 0 (
        docker exec sebo-postgres pg_isready -U sebo >nul 2>&1
        if !errorlevel! equ 0 (
            set READY=1
            echo       PostgreSQL pronto.
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)
if !READY! equ 0 (
    echo [ERRO] PostgreSQL nao ficou pronto em 30 segundos.
    pause
    exit /b 1
)

REM ---------------------- 2. Backend ---------------------------
echo.
echo [3/7] Instalando dependencias do backend...
cd /d "%ROOT_DIR%backend"
call npm install --silent
echo       Dependencias do backend instaladas.

if not exist .env (
    copy .env.example .env >nul
    echo       Arquivo .env criado a partir do .env.example.
) else (
    echo       Arquivo .env ja existe.
)

echo.
echo [4/7] Rodando migrations do banco de dados...
call npx prisma migrate dev --name init --skip-generate 2>nul || call npx prisma migrate deploy 2>nul || call npx prisma db push --skip-generate 2>nul
call npx prisma generate
echo       Schema do banco sincronizado.

echo.
echo [5/7] Populando banco com dados iniciais (seed)...
call npx prisma db seed 2>nul
echo       Seed executado.

echo.
echo [6/7] Fazendo build do backend...
call npm run build
echo       Backend compilado.

REM ---------------------- 3. Frontend --------------------------
echo.
echo [7/7] Instalando dependencias do frontend...
cd /d "%ROOT_DIR%frontend"
call npm install --silent
echo       Dependencias do frontend instaladas.

if not exist .env.local (
    copy .env.example .env.local >nul
    echo       Arquivo .env.local criado a partir do .env.example.
) else (
    echo       Arquivo .env.local ja existe.
)

REM ---------------------- 4. Iniciar servidores ----------------
echo.
echo ========================================================
echo   Build concluido com sucesso!
echo ========================================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo.
echo   Login:     admin@admin.com
echo   Senha:     admin123
echo.
echo   Iniciando servidores em janelas separadas...
echo   Feche as janelas para parar.
echo.

cd /d "%ROOT_DIR%backend"
start "SeboStock - Backend" cmd /k "npm run start:dev"

cd /d "%ROOT_DIR%frontend"
start "SeboStock - Frontend" cmd /k "npm run dev"

echo   Servidores iniciados! Verifique as janelas abertas.
echo.
pause

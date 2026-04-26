@echo off
setlocal enabledelayedexpansion

REM Emulates .github\workflows\ci.yml locally.
REM Requirements: Node.js 20+, npm, and network access for npm/Playwright installs.

set "ROOT_DIR=%~dp0"

where node >nul 2>&1 || (
    echo ERROR: Node.js is not installed.
    exit /b 1
)

where npm >nul 2>&1 || (
    echo ERROR: npm is not installed.
    exit /b 1
)

for /f "usebackq delims=" %%v in (`node -p "Number(process.versions.node.split('.')[0])"`) do set "NODE_MAJOR=%%v"
if %NODE_MAJOR% lss 20 (
    for /f "usebackq delims=" %%v in (`node --version`) do set "NODE_VERSION=%%v"
    echo ERROR: Node.js 20+ is required. Current version: !NODE_VERSION!
    exit /b 1
)

echo.
echo ==> Frontend CI: install dependencies
cd /d "%ROOT_DIR%frontend" || exit /b 1
call npm ci || exit /b 1

echo.
echo ==> Frontend CI: lint
call npm run lint || exit /b 1

echo.
echo ==> Frontend CI: type-check
call npm run type-check || exit /b 1

echo.
echo ==> Frontend CI: Vitest coverage
call npm run test:coverage || exit /b 1

echo.
echo ==> Frontend CI: install Playwright Chromium
call npx playwright install --with-deps chromium || exit /b 1

echo.
echo ==> Frontend CI: build
call npm run build || exit /b 1

echo.
echo ==> Frontend CI: Playwright E2E
set "CI=true"
call npm run test:e2e || exit /b 1
echo OK: Frontend CI completed

echo.
echo ==> Backend CI: install dependencies
cd /d "%ROOT_DIR%backend" || exit /b 1
call npm ci || exit /b 1

echo.
echo ==> Backend CI: generate Prisma client
call npx prisma generate || exit /b 1

echo.
echo ==> Backend CI: lint
call npm run lint || exit /b 1

echo.
echo ==> Backend CI: unit tests with coverage
call npm run test:cov || exit /b 1
echo OK: Backend CI completed

echo.
echo Local CI/CD emulation completed successfully.

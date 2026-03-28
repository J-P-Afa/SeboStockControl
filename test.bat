@echo off

echo Running Backend Unit Tests...
cd backend
call npm test
if %errorlevel% neq 0 (
    echo Backend tests failed.
    exit /b %errorlevel%
)
cd ..

echo.
echo Running Frontend Unit Tests...
cd frontend
call npm test
if %errorlevel% neq 0 (
    echo Frontend tests failed.
    exit /b %errorlevel%
)
cd ..

echo.
echo All unit tests passed successfully!

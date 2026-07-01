@echo off
echo Creating directory structure...
mkdir backend\models\voice_cloning 2>nul
mkdir backend\models\tts 2>nul
mkdir backend\storage 2>nul
mkdir frontend\public 2>nul

echo Setting up environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env
) else (
    echo ⚠️  backend\.env already exists
)

if not exist frontend\.env.local (
    copy frontend\.env.local.example frontend\.env.local
    echo ✅ Created frontend\.env.local
) else (
    echo ⚠️  frontend\.env.local already exists
)

echo Creating required directories...
mkdir backend\storage 2>nul
mkdir backend\models 2>nul

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Review and adjust settings in backend\.env if needed
echo 2. Run 'docker-compose up --build' to start the application
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
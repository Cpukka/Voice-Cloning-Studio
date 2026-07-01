#!/bin/bash

# Create directory structure
echo "Creating directory structure..."
mkdir -p backend/models/voice_cloning
mkdir -p backend/models/tts
mkdir -p backend/storage
mkdir -p frontend/public

# Copy environment files
echo "Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "⚠️  frontend/.env.local already exists"
fi

# Create necessary directories
echo "Creating required directories..."
mkdir -p backend/storage
mkdir -p backend/models

# Set permissions
chmod -R 755 backend/storage
chmod -R 755 backend/models

# Generate random secret key for JWT
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    RANDOM_KEY=$(openssl rand -base64 32)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    RANDOM_KEY=$(openssl rand -base64 32)
else
    # Windows or others
    RANDOM_KEY="change-this-to-a-random-secret-key-in-production"
fi

# Update .env with random secret key
if [[ "$OSTYPE" != "msys"* ]]; then
    sed -i '' "s/your-super-secret-key-change-this-to-a-random-string-in-production/$RANDOM_KEY/g" backend/.env 2>/dev/null || \
    sed -i "s/your-super-secret-key-change-this-to-a-random-string-in-production/$RANDOM_KEY/g" backend/.env
    echo "✅ Generated random JWT secret key"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and adjust settings in backend/.env if needed"
echo "2. Run 'docker-compose up --build' to start the application"
echo "3. Or for local development:"
echo "   - Backend: cd backend && uvicorn app.main:app --reload"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Default database credentials (docker-compose):"
echo "  Database: postgresql://voiceuser:voicepass123@localhost:5432/voice_cloning"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
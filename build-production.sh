#!/bin/bash

echo "🚀 MailPort Production Build başlatılıyor..."

# Frontend build
echo "📦 Frontend build ediliyor..."
cd frontend
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Frontend build başarılı!"
    
    # Build dosyalarını production dizinine kopyala
    echo "📁 Build dosyaları kopyalanıyor..."
    
    # Build dizinini temizle
    rm -rf ../build-production
    mkdir -p ../build-production
    
    # Frontend build dosyalarını kopyala
    cp -r build/* ../build-production/
    
    # Backend dosyalarını kopyala (node_modules hariç)
    echo "📂 Backend dosyaları kopyalanıyor..."
    cd ../backend
    
    # Backend için gerekli dosyaları kopyala
    rsync -av --exclude='node_modules' --exclude='uploads' --exclude='.env' . ../build-production/backend/
    
    # Production .env dosyası oluştur
    cat > ../build-production/backend/.env << EOF
# Server Configuration
PORT=5052
NODE_ENV=production

# Database Configuration  
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mailport_db
DB_USER=root
DB_PASSWORD=YOUR_DB_PASSWORD

# Email Configuration
IMAP_HOST=mail.iesyazilim.com.tr
IMAP_PORT=143
IMAP_USER=gurkan.altay@iesyazilim.com.tr
IMAP_PASSWORD=YOUR_IMAP_PASSWORD
IMAP_TLS=false

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false

# Default Forward Email
DEFAULT_FORWARD_EMAIL=forward@company.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
JWT_SECRET=your-super-secret-jwt-key-here-change-this
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://mailport.iesyazilim.com.tr
EOF

    echo "✅ Production build tamamlandı!"
    echo "📂 Build dosyaları: build-production/ dizininde"
    echo ""
    echo "🚀 Deployment adımları:"
    echo "1. build-production/ dizinini sunucuya yükle"
    echo "2. Backend dizininde: npm install --production"
    echo "3. .env dosyasını düzenle"
    echo "4. pm2 start server.js --name mailport-backend"
    echo "5. Frontend dosyalarını nginx'e yerleştir"
    
else
    echo "❌ Frontend build başarısız!"
    exit 1
fi
# MailPort - Kurumsal E-posta Yönetim Sistemi

Kurumsal e-posta adreslerine gelen mailleri otomatik olarak dinleyen, organize eden ve yöneten modern web uygulaması.

## 🚀 Özellikler

### 📧 E-posta Yönetimi
- **Otomatik Mail İzleme**: IMAP protokolü ile e-postaları otomatik dinleme
- **Akıllı Organizasyon**: Tarih-saat, firma adı, gönderen, konu, içerik ve eklentiler halinde ayrıştırma
- **Tablo Görünümü**: Tüm mailler responsive tablo formatında listeleme
- **Arama ve Filtreleme**: İçerik bazlı arama ve durum filtreleme

### 🔄 İşlem Yönetimi
- **İletme**: Mailleri önceden belirlenmiş adreslere iletme
- **Cevaplama**: Sistem üzerinden direkt mail yanıtlama
- **Düzenleme**: Firma adı ve gönderen bilgilerini manuel düzenleme
- **Durum Takibi**: Okundu, iletildi, yanıtlandı durumlarını takip

### 🤖 Akıllı Özellikler
- **Otomatik Firma Çıkarımı**: E-posta domain'inden firma adı çıkarma
- **Gönderen İsim Analizi**: E-posta başlığından kişi adı çıkarma
- **Manuel Geçersiz Kılma**: Kullanıcı müdahalesinde otomatik veriyi devre dışı bırakma
- **Akıllı Önbellekleme**: Öğrenilen bilgileri kaydetme

### 📊 Raporlama ve Loglama
- **İşlem Logları**: Tüm eylemler (iletme, cevaplama, düzenleme) detaylı loglama
- **Kullanıcı Takibi**: IP adresi ve tarayıcı bilgisi kaydetme
- **İstatistikler**: Mail durumları ve işlem raporları
- **Zaman Damgası**: Her işlem için otomatik zaman kaydı

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MySQL**: İlişkisel veritabanı
- **Sequelize**: ORM (Object-Relational Mapping)
- **IMAP**: E-posta okuma protokolü
- **SMTP**: E-posta gönderme protokolü
- **Nodemailer**: E-posta işlemleri

### Frontend
- **React 18**: Modern UI library
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching ve cache yönetimi
- **React Hot Toast**: Bildirim sistemi
- **Axios**: HTTP client
- **Moment.js**: Tarih-zaman işlemleri

### Güvenlik ve Performans
- **Helmet**: HTTP güvenlik başlıkları
- **Rate Limiting**: API istek sınırlama
- **CORS**: Cross-origin resource sharing
- **DOMPurify**: XSS koruması
- **Compression**: Response sıkıştırma

## 📁 Proje Yapısı

```
mailport.iesyazilim.com.tr/
├── backend/
│   ├── config/          # Veritabanı ve uygulama konfigürasyonu
│   ├── controllers/     # İş mantığı ve API endpoint'leri
│   ├── models/          # Sequelize modelleri
│   ├── routes/          # Express route tanımları
│   ├── services/        # E-posta servisleri
│   ├── utils/           # Yardımcı fonksiyonlar
│   ├── middleware/      # Express middleware'ler
│   └── server.js        # Ana sunucu dosyası
├── frontend/
│   ├── src/
│   │   ├── components/  # React bileşenleri
│   │   ├── pages/       # Sayfa bileşenleri
│   │   ├── services/    # API servisleri
│   │   └── utils/       # Yardımcı fonksiyonlar
│   └── public/          # Statik dosyalar
└── database-schema.sql  # MySQL veritabanı şeması
```

## 🗃️ Veritabanı Şeması

### Tablolar
- **emails**: Ana e-posta verileri
- **email_attachments**: E-posta eklentileri
- **action_logs**: İşlem logları
- **forwarded_emails**: İletme işlem geçmişi
- **replied_emails**: Yanıtlama işlem geçmişi
- **settings**: Sistem ayarları

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js (v16 veya üzeri)
- MySQL (v8.0 veya üzeri)
- npm veya yarn

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd mailport.iesyazilim.com.tr
```

### 2. Bağımlılıkları Yükleyin
```bash
npm run install:all
```

### 3. Veritabanını Kurun
```bash
# MySQL'de veritabanı oluşturun
mysql -u root -p < database-schema.sql
```

### 4. Ortam Değişkenlerini Ayarlayın
```bash
# Backend
cd backend
cp .env.example .env
# .env dosyasını düzenleyin

# E-posta ayarları
IMAP_HOST=imap.gmail.com
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password

SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Veritabanı ayarları
DB_HOST=localhost
DB_NAME=mailport_db
DB_USER=root
DB_PASSWORD=your-password
```

### 5. Uygulamayı Başlatın
```bash
# Geliştirme ortamı (hem frontend hem backend)
npm run dev

# Sadece backend
npm run server:dev

# Sadece frontend
npm run client:dev
```

### 6. Erişim Bilgileri
- **Frontend**: http://localhost:3010
- **Backend API**: http://localhost:5051
- **Health Check**: http://localhost:5051/health

## 🌐 Canlı Ortam

- **Web Sitesi**: https://mailport.iesyazilim.com.tr
- **API**: https://api.mailport.iesyazilim.com.tr

## 📱 Responsive Tasarım

Uygulama tamamen responsive olarak tasarlanmıştır:
- **Mobil**: Akıllı telefon ve tablet desteği
- **Tablet**: Orta boy ekranlar için optimize
- **Desktop**: Büyük ekranlar için tam özellik

## 🔐 Güvenlik

- **XSS Koruması**: Girdi sanitizasyonu
- **CSRF Koruması**: Cross-site request forgery önleme
- **Rate Limiting**: API abuse önleme
- **Güvenli Headers**: Helmet.js ile HTTP güvenlik başlıkları
- **Dosya Upload Güvenliği**: Dosya türü ve boyut kontrolleri

## 📊 Performans

- **Lazy Loading**: Sayfa bazlı yükleme
- **Caching**: React Query ile akıllı önbellekleme
- **Compression**: Response sıkıştırma
- **Database Indexing**: Optimized veritabanı sorguları

## 🔄 API Endpoints

### E-posta İşlemleri
- `GET /api/emails` - E-posta listesi
- `GET /api/emails/:id` - E-posta detayı
- `PUT /api/emails/:id` - E-posta güncelleme
- `POST /api/emails/:id/forward` - E-posta iletme
- `POST /api/emails/:id/reply` - E-posta yanıtlama
- `GET /api/emails/stats` - İstatistikler

### Ek Dosya İşlemleri
- `GET /api/emails/attachments/:id/download` - Ek dosya indirme

## 🐛 Hata Ayıklama

### Genel Kontroller
1. MySQL servisi çalışıyor mu?
2. IMAP/SMTP ayarları doğru mu?
3. Port 3010 ve 5051 açık mı?
4. Node.js versiyonu uygun mu?

### Log Kontrolü
```bash
# Backend logları
cd backend && npm run dev

# Tarayıcı konsolu
F12 > Console tab
```

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 İletişim

**IES Yazılım**
- Web: https://iesyazilim.com.tr
- E-posta: info@iesyazilim.com.tr

---

📧 **MailPort** - Kurumsal e-posta yönetiminizi bir sonraki seviyeye taşıyın!
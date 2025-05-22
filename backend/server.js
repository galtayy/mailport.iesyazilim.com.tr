const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const emailRoutes = require('./routes/emails');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const settingsRoutes = require('./routes/settings');
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5051;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => {
    // Development ortamında veya OPTIONS isteklerinde rate limiting'i atla
    return process.env.NODE_ENV === 'development' || req.method === 'OPTIONS';
  },
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Development ortamında rate limiting'i devre dışı bırak
if (process.env.NODE_ENV !== 'development') {
  app.use(limiter);
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).json({ 
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Bilinmeyen hata'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    await sequelize.sync({ alter: false });
    console.log('Veritabanı modelleri senkronize edildi');

    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`CORS Origin: ${process.env.CORS_ORIGIN}`);
    });

    if (process.env.IMAP_USER && process.env.IMAP_PASSWORD) {
      setTimeout(() => {
        emailService.startEmailMonitoring();
      }, 5000);
    } else {
      console.warn('IMAP ayarları eksik, e-posta izleme başlatılmadı');
    }

  } catch (error) {
    console.error('Server başlatma hatası:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Server kapatılıyor...');
  await emailService.disconnect();
  await sequelize.close();
  process.exit(0);
});

startServer();
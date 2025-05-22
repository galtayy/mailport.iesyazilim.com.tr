const { User } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/database');

const settingsController = {
  // E-posta ayarları alma
  async getEmailSettings(req, res) {
    try {
      const settings = {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || '',
        smtpSecure: process.env.SMTP_SECURE === 'true',
        imapHost: process.env.IMAP_HOST || '',
        imapPort: process.env.IMAP_PORT || '993',
        imapUser: process.env.IMAP_USER || '',
        imapTls: process.env.IMAP_TLS !== 'false',
        defaultForwardEmail: process.env.DEFAULT_FORWARD_EMAIL || ''
      };

      res.json({ settings });
    } catch (error) {
      console.error('E-posta ayarları hatası:', error);
      res.status(500).json({ error: 'E-posta ayarları alınırken hata oluştu' });
    }
  },

  // E-posta ayarları güncelleme
  async updateEmailSettings(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const schema = Joi.object({
        smtpHost: Joi.string().allow(''),
        smtpPort: Joi.number().min(1).max(65535),
        smtpUser: Joi.string().email().allow(''),
        smtpPassword: Joi.string().allow(''),
        smtpSecure: Joi.boolean(),
        imapHost: Joi.string().allow(''),
        imapPort: Joi.number().min(1).max(65535),
        imapUser: Joi.string().email().allow(''),
        imapPassword: Joi.string().allow(''),
        imapTls: Joi.boolean(),
        defaultForwardEmail: Joi.string().email().allow('')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      // .env dosyasını güncelle (gerçek uygulamada daha güvenli bir yöntem kullanılmalı)
      const envPath = path.join(__dirname, '../.env');
      let envContent = '';
      
      try {
        envContent = await fs.readFile(envPath, 'utf8');
      } catch (err) {
        // .env dosyası yoksa oluştur
        envContent = '';
      }

      // Mevcut ayarları güncelle veya ekle
      const updateEnvVar = (key, value) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      };

      if (value.smtpHost !== undefined) updateEnvVar('SMTP_HOST', value.smtpHost);
      if (value.smtpPort !== undefined) updateEnvVar('SMTP_PORT', value.smtpPort);
      if (value.smtpUser !== undefined) updateEnvVar('SMTP_USER', value.smtpUser);
      if (value.smtpPassword !== undefined && value.smtpPassword !== '') {
        updateEnvVar('SMTP_PASSWORD', value.smtpPassword);
      }
      if (value.smtpSecure !== undefined) updateEnvVar('SMTP_SECURE', value.smtpSecure);
      if (value.imapHost !== undefined) updateEnvVar('IMAP_HOST', value.imapHost);
      if (value.imapPort !== undefined) updateEnvVar('IMAP_PORT', value.imapPort);
      if (value.imapUser !== undefined) updateEnvVar('IMAP_USER', value.imapUser);
      if (value.imapPassword !== undefined && value.imapPassword !== '') {
        updateEnvVar('IMAP_PASSWORD', value.imapPassword);
      }
      if (value.imapTls !== undefined) updateEnvVar('IMAP_TLS', value.imapTls);
      if (value.defaultForwardEmail !== undefined) updateEnvVar('DEFAULT_FORWARD_EMAIL', value.defaultForwardEmail);

      await fs.writeFile(envPath, envContent);

      res.json({ 
        message: 'E-posta ayarları güncellendi. Değişikliklerin etkili olması için sunucuyu yeniden başlatın.' 
      });
    } catch (error) {
      console.error('E-posta ayarları güncelleme hatası:', error);
      res.status(500).json({ error: 'E-posta ayarları güncellenirken hata oluştu' });
    }
  },

  // Sistem bilgileri
  async getSystemInfo(req, res) {
    try {
      const nodeVersion = process.version;
      const platform = process.platform;
      const arch = process.arch;
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      // Veritabanı bilgileri
      const dbVersion = await sequelize.query('SELECT VERSION() as version', { 
        type: sequelize.QueryTypes.SELECT 
      });

      // Disk kullanımı (uploads klasörü)
      const uploadsPath = path.join(__dirname, '../../uploads');
      let uploadSize = 0;
      let uploadCount = 0;

      try {
        const files = await fs.readdir(uploadsPath);
        for (const file of files) {
          if (file !== '.gitkeep') {
            const stats = await fs.stat(path.join(uploadsPath, file));
            uploadSize += stats.size;
            uploadCount++;
          }
        }
      } catch (err) {
        // Klasör yoksa veya erişim hatası
      }

      res.json({
        system: {
          nodeVersion,
          platform,
          arch,
          uptime: Math.floor(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024)
          }
        },
        database: {
          version: dbVersion[0]?.version || 'Bilinmiyor'
        },
        uploads: {
          count: uploadCount,
          sizeMB: Math.round(uploadSize / 1024 / 1024 * 100) / 100
        }
      });
    } catch (error) {
      console.error('Sistem bilgileri hatası:', error);
      res.status(500).json({ error: 'Sistem bilgileri alınırken hata oluştu' });
    }
  },

  // Test e-posta gönderme
  async sendTestEmail(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const schema = Joi.object({
        to: Joi.string().email().required(),
        subject: Joi.string().required(),
        content: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: value.to,
        subject: value.subject,
        text: value.content,
        html: value.content.replace(/\n/g, '<br>')
      });

      res.json({ message: 'Test e-postası başarıyla gönderildi' });
    } catch (error) {
      console.error('Test e-posta hatası:', error);
      res.status(500).json({ 
        error: 'Test e-postası gönderilirken hata oluştu',
        details: error.message 
      });
    }
  },

  // Veritabanı temizleme
  async cleanupDatabase(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const schema = Joi.object({
        olderThanDays: Joi.number().min(1).max(365).required(),
        deleteAttachments: Joi.boolean().default(true)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - value.olderThanDays);

      // Eski e-postaları bul
      const oldEmails = await Email.findAll({
        where: {
          dateReceived: { [Op.lt]: cutoffDate }
        },
        include: ['attachments']
      });

      let deletedEmails = 0;
      let deletedFiles = 0;

      // Ek dosyaları sil
      if (value.deleteAttachments) {
        for (const email of oldEmails) {
          for (const attachment of email.attachments) {
            try {
              await fs.unlink(attachment.filePath);
              deletedFiles++;
            } catch (err) {
              // Dosya zaten silinmiş olabilir
            }
          }
        }
      }

      // E-postaları sil (CASCADE ile ek dosya kayıtları da silinir)
      const result = await Email.destroy({
        where: {
          dateReceived: { [Op.lt]: cutoffDate }
        }
      });

      deletedEmails = result;

      res.json({ 
        message: `Temizleme tamamlandı`,
        deleted: {
          emails: deletedEmails,
          files: deletedFiles
        }
      });
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error);
      res.status(500).json({ error: 'Veritabanı temizlenirken hata oluştu' });
    }
  }
};

module.exports = settingsController;
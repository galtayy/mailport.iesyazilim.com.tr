const { Email, EmailAttachment, ActionLog, User } = require('../models');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const conversationService = require('../services/conversationService');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const emailController = {
  async getAllEmails(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        status, 
        sortBy = 'dateReceived', 
        sortOrder = 'DESC',
        conversationMode = 'true' 
      } = req.query;
      
      const where = {};
      
      // Conversation mode: sadece root email'leri veya conversation'ı olmayan email'leri getir
      if (conversationMode === 'true') {
        where[Op.or] = [
          { isConversationRoot: true },
          { conversationId: null }
        ];
      }
      
      if (search) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push({
          [Op.or]: [
            { senderEmail: { [Op.like]: `%${search}%` } },
            { senderName: { [Op.like]: `%${search}%` } },
            { companyName: { [Op.like]: `%${search}%` } },
            { subject: { [Op.like]: `%${search}%` } }
          ]
        });
      }
      
      if (status) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push({ status });
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Email.findAndCountAll({
        where,
        include: [
          {
            model: EmailAttachment,
            as: 'attachments',
            attributes: ['id', 'filename', 'originalFilename', 'fileSize', 'mimeType']
          },
          {
            model: User,
            as: 'readByUser',
            attributes: ['id', 'fullName'],
            required: false
          },
          {
            model: User,
            as: 'lastActionUser',
            attributes: ['id', 'fullName'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Her conversation root email için conversation email sayısını hesapla
      const enrichedEmails = await Promise.all(rows.map(async (email) => {
        const emailData = email.toJSON();
        
        if (email.conversationId) {
          const conversationCount = await Email.count({
            where: { conversationId: email.conversationId }
          });
          emailData.conversationCount = conversationCount;
          
          // Conversation'daki en son email tarihini al
          const latestEmail = await Email.findOne({
            where: { conversationId: email.conversationId },
            order: [['dateReceived', 'DESC']]
          });
          emailData.latestEmailDate = latestEmail?.dateReceived || email.dateReceived;
        } else {
          emailData.conversationCount = 1;
          emailData.latestEmailDate = email.dateReceived;
        }
        
        return emailData;
      }));

      res.json({
        emails: enrichedEmails,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Email listesi hatası:', error);
      res.status(500).json({ error: 'Email listesi alınırken hata oluştu' });
    }
  },

  async getEmailById(req, res) {
    try {
      const { id } = req.params;
      
      const email = await Email.findByPk(id, {
        include: [
          {
            model: EmailAttachment,
            as: 'attachments'
          },
          {
            model: User,
            as: 'readByUser',
            attributes: ['id', 'fullName'],
            required: false
          },
          {
            model: User,
            as: 'lastActionUser',
            attributes: ['id', 'fullName'],
            required: false
          }
        ]
      });

      if (!email) {
        return res.status(404).json({ error: 'Email bulunamadı' });
      }

      if (email.status === 'unread') {
        console.log('Marking email as read, userId:', req.user.id);
        await email.update({ 
          status: 'read',
          readByUserId: req.user.id,
          readAt: new Date()
        });
        
        console.log('After update:', {
          status: email.status,
          readByUserId: email.readByUserId,
          readAt: email.readAt
        });
        
        await ActionLog.create({
          emailId: id,
          actionType: 'mark_read',
          userId: req.user.id,
          userIp: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        // E-postayı güncellenmiş kullanıcı bilgileriyle tekrar çek
        await email.reload({
          include: [
            {
              model: EmailAttachment,
              as: 'attachments'
            },
            {
              model: User,
              as: 'readByUser',
              attributes: ['id', 'fullName'],
              required: false
            },
            {
              model: User,
              as: 'lastActionUser',
              attributes: ['id', 'fullName'],
              required: false
            }
          ]
        });
      }

      res.json(email);
    } catch (error) {
      console.error('Email detay hatası:', error);
      res.status(500).json({ error: 'Email detayı alınırken hata oluştu' });
    }
  },

  async updateEmail(req, res) {
    try {
      const { id } = req.params;
      const { senderName, companyName, updateAll = false } = req.body;

      const email = await Email.findByPk(id);
      if (!email) {
        return res.status(404).json({ error: 'Email bulunamadı' });
      }

      const updates = {};
      const logs = [];
      let affectedCount = 1;

      if (senderName !== undefined && senderName !== email.senderName) {
        logs.push({
          emailId: id,
          actionType: 'edit_sender',
          oldValue: email.senderName,
          newValue: senderName,
          userId: req.user.id,
          userIp: req.ip,
          userAgent: req.get('User-Agent')
        });
        updates.senderName = senderName;
        updates.isSenderNameManual = true;
      }

      if (companyName !== undefined && companyName !== email.companyName) {
        logs.push({
          emailId: id,
          actionType: 'edit_company',
          oldValue: email.companyName,
          newValue: companyName,
          userId: req.user.id,
          userIp: req.ip,
          userAgent: req.get('User-Agent')
        });
        updates.companyName = companyName;
        updates.isCompanyNameManual = true;

        // Eğer updateAll true ise, aynı domain'den gelen tüm mailleri güncelle
        if (updateAll && companyName) {
          const emailDomain = email.senderEmail.split('@')[1];
          
          if (emailDomain) {
            const bulkUpdateResult = await Email.update(
              { 
                companyName,
                isCompanyNameManual: true 
              },
              { 
                where: {
                  senderEmail: { [Op.like]: `%@${emailDomain}` },
                  isCompanyNameManual: false // Sadece manuel olmayan kayıtları güncelle
                }
              }
            );
            
            affectedCount = bulkUpdateResult[0] || 1;
            
            // Toplu güncelleme logu
            await ActionLog.create({
              emailId: id,
              actionType: 'edit_company',
              oldValue: email.companyName,
              newValue: `${companyName} (${affectedCount} mail güncellendi - domain: ${emailDomain})`,
              userId: req.user.id,
              userIp: req.ip,
              userAgent: req.get('User-Agent')
            });
          }
        }
      }

      // Ana email'i güncelle
      if (Object.keys(updates).length > 0) {
        await email.update(updates);
        
        if (logs.length > 0 && !updateAll) {
          await ActionLog.bulkCreate(logs);
        }
      }

      res.json({ 
        message: `Email başarıyla güncellendi${updateAll ? ` (${affectedCount} mail etkilendi)` : ''}`, 
        email,
        affectedCount 
      });
    } catch (error) {
      console.error('Email güncelleme hatası:', error);
      res.status(500).json({ error: 'Email güncellenirken hata oluştu' });
    }
  },

  async forwardEmail(req, res) {
    try {
      const { id } = req.params;
      const { to, message } = req.body;

      const email = await Email.findByPk(id, {
        include: [{
          model: EmailAttachment,
          as: 'attachments'
        }]
      });

      if (!email) {
        return res.status(404).json({ error: 'Email bulunamadı' });
      }

      const forwardSubject = `Fwd: ${email.subject}`;
      const forwardContent = `
${message || ''}

---------- Forwarded message ---------
From: ${email.senderName} <${email.senderEmail}>
Date: ${email.dateReceived}
Subject: ${email.subject}

${email.content}
      `;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: to || process.env.DEFAULT_FORWARD_EMAIL,
        subject: forwardSubject,
        text: forwardContent,
        html: email.htmlContent ? `
          <div>${message || ''}</div>
          <br>
          <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 10px;">
            <p><strong>---------- Forwarded message ---------</strong></p>
            <p><strong>From:</strong> ${email.senderName} &lt;${email.senderEmail}&gt;</p>
            <p><strong>Date:</strong> ${email.dateReceived}</p>
            <p><strong>Subject:</strong> ${email.subject}</p>
            <br>
            ${email.htmlContent}
          </div>
        ` : undefined
      };

      await transporter.sendMail(mailOptions);

      await email.update({ 
        status: 'forwarded',
        lastActionUserId: req.user.id,
        lastActionAt: new Date()
      });

      await ActionLog.create({
        emailId: id,
        actionType: 'forward',
        newValue: to || process.env.DEFAULT_FORWARD_EMAIL,
        userId: req.user.id,
        userIp: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Email başarıyla iletildi' });
    } catch (error) {
      console.error('Email iletme hatası:', error);
      res.status(500).json({ error: 'Email iletilirken hata oluştu' });
    }
  },

  async replyEmail(req, res) {
    try {
      const { id } = req.params;
      const { content, subject } = req.body;

      const email = await Email.findByPk(id);
      if (!email) {
        return res.status(404).json({ error: 'Email bulunamadı' });
      }

      const replySubject = subject || `Re: ${email.subject}`;
      
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email.senderEmail,
        subject: replySubject,
        text: content,
        html: content.replace(/\n/g, '<br>')
      };

      await transporter.sendMail(mailOptions);

      await email.update({ 
        status: 'replied',
        lastActionUserId: req.user.id,
        lastActionAt: new Date()
      });

      await ActionLog.create({
        emailId: id,
        actionType: 'reply',
        newValue: content,
        userId: req.user.id,
        userIp: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Email başarıyla yanıtlandı' });
    } catch (error) {
      console.error('Email yanıtlama hatası:', error);
      res.status(500).json({ error: 'Email yanıtlanırken hata oluştu' });
    }
  },

  async downloadAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      
      const attachment = await EmailAttachment.findByPk(attachmentId);
      if (!attachment) {
        return res.status(404).json({ error: 'Ek dosya bulunamadı' });
      }

      res.download(attachment.filePath, attachment.originalFilename);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      res.status(500).json({ error: 'Dosya indirilirken hata oluştu' });
    }
  },

  async getStats(req, res) {
    try {
      const totalEmails = await Email.count();
      const unreadEmails = await Email.count({ where: { status: 'unread' } });
      const forwardedEmails = await Email.count({ where: { status: 'forwarded' } });
      const repliedEmails = await Email.count({ where: { status: 'replied' } });

      res.json({
        total: totalEmails,
        unread: unreadEmails,
        forwarded: forwardedEmails,
        replied: repliedEmails
      });
    } catch (error) {
      console.error('İstatistik hatası:', error);
      res.status(500).json({ error: 'İstatistikler alınırken hata oluştu' });
    }
  },

  downloadAttachment: async (req, res) => {
    try {
      const { attachmentId } = req.params;
      
      const attachment = await EmailAttachment.findByPk(attachmentId);
      if (!attachment) {
        return res.status(404).json({ error: 'Ek dosya bulunamadı' });
      }

      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({ error: 'Dosya bulunamadı' });
      }

      res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalFilename}"`);
      
      const fileStream = fs.createReadStream(attachment.filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      res.status(500).json({ error: 'Dosya indirilirken hata oluştu' });
    }
  },

  viewAttachment: async (req, res) => {
    try {
      const { attachmentId } = req.params;
      
      const attachment = await EmailAttachment.findByPk(attachmentId);
      if (!attachment) {
        return res.status(404).json({ error: 'Ek dosya bulunamadı' });
      }

      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({ error: 'Dosya bulunamadı' });
      }

      // Sadece resim dosyaları için inline gösterim
      const mimeType = attachment.mimeType || 'application/octet-stream';
      if (!mimeType.startsWith('image/')) {
        return res.status(400).json({ error: 'Bu dosya görüntülenemez' });
      }

      // CORS ve güvenlik başlıkları
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      const fileStream = fs.createReadStream(attachment.filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Dosya görüntüleme hatası:', error);
      res.status(500).json({ error: 'Dosya görüntülenirken hata oluştu' });
    }
  },

  getConversationEmails: async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      const emails = await conversationService.getConversationEmails(conversationId);
      
      res.json({
        emails,
        count: emails.length
      });
    } catch (error) {
      console.error('Conversation email\'leri alma hatası:', error);
      res.status(500).json({ error: 'Conversation email\'leri alınırken hata oluştu' });
    }
  },

  organizeConversations: async (req, res) => {
    try {
      const result = await conversationService.organizeExistingEmails();
      
      res.json({
        message: 'Email\'ler başarıyla organize edildi',
        ...result
      });
    } catch (error) {
      console.error('Email organize hatası:', error);
      res.status(500).json({ error: 'Email\'ler organize edilirken hata oluştu' });
    }
  },

  getConversationStats: async (req, res) => {
    try {
      const stats = await conversationService.getConversationStats();
      
      res.json(stats);
    } catch (error) {
      console.error('Conversation istatistik hatası:', error);
      res.status(500).json({ error: 'Conversation istatistikleri alınırken hata oluştu' });
    }
  },

  getEmailHistory: async (req, res) => {
    try {
      const { id } = req.params;
      
      const logs = await ActionLog.findAll({
        where: { emailId: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });


      res.json(logs);
    } catch (error) {
      console.error('Email geçmişi hatası:', error);
      res.status(500).json({ error: 'Email geçmişi alınırken hata oluştu' });
    }
  }
};

module.exports = emailController;
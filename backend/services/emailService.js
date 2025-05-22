const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');
const { Email, EmailAttachment } = require('../models');
const { extractCompanyName, extractSenderName } = require('../utils/emailParser');

class EmailService {
  constructor() {
    this.imap = null;
    this.isConnected = false;
    this.config = {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS !== 'false',
      authTimeout: 3000,
      connTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    };
  }

  async connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        return resolve();
      }

      this.imap = new Imap(this.config);

      this.imap.once('ready', () => {
        this.isConnected = true;
        console.log('IMAP bağlantısı başarılı');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('IMAP bağlantı hatası:', err);
        this.isConnected = false;
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP bağlantısı sonlandı');
        this.isConnected = false;
      });

      this.imap.connect();
    });
  }

  async disconnect() {
    if (this.imap && this.isConnected) {
      this.imap.end();
      this.isConnected = false;
    }
  }

  async fetchNewEmails() {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);

          this.imap.search(['UNSEEN', ['SINCE', lastWeek]], (err, results) => {
            if (err) return reject(err);

            if (!results || results.length === 0) {
              console.log('Yeni mail bulunamadı');
              return resolve([]);
            }

            console.log(`${results.length} yeni mail bulundu`);
            
            const fetch = this.imap.fetch(results, {
              bodies: '',
              struct: true,
              markSeen: false
            });

            const emails = [];

            fetch.on('message', (msg, seqno) => {
              let buffer = '';

              msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
              });

              msg.once('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  const emailData = await this.processEmail(parsed);
                  emails.push(emailData);
                } catch (parseErr) {
                  console.error('Mail parse hatası:', parseErr);
                }
              });
            });

            fetch.once('error', reject);
            fetch.once('end', () => resolve(emails));
          });
        });
      });
    } catch (error) {
      console.error('Mail çekme hatası:', error);
      throw error;
    }
  }

  async processEmail(parsed) {
    const messageId = parsed.messageId || `${Date.now()}-${Math.random()}`;
    
    const existingEmail = await Email.findOne({ 
      where: { messageId } 
    });

    if (existingEmail) {
      return existingEmail;
    }

    const senderEmail = parsed.from?.value?.[0]?.address || '';
    const senderName = extractSenderName(parsed.from?.value?.[0]?.name || senderEmail);
    
    // Önce aynı e-posta adresinden önceki mailleri kontrol et
    const previousEmail = await Email.findOne({
      where: { senderEmail },
      order: [['dateReceived', 'DESC']]
    });
    
    // Eğer önceki mailden firma ismi varsa onu kullan, yoksa otomatik çıkar
    const companyName = previousEmail?.companyName || extractCompanyName(senderEmail, senderName);

    const emailData = {
      messageId,
      dateReceived: parsed.date || new Date(),
      senderEmail,
      senderName,
      companyName,
      subject: parsed.subject || '',
      content: parsed.text || '',
      htmlContent: parsed.html || '',
      hasAttachments: (parsed.attachments && parsed.attachments.length > 0),
      status: 'unread'
    };

    const email = await Email.create(emailData);

    if (parsed.attachments && parsed.attachments.length > 0) {
      await this.saveAttachments(email.id, parsed.attachments);
    }

    return email;
  }

  async saveAttachments(emailId, attachments) {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    for (const attachment of attachments) {
      const filename = `${Date.now()}-${Math.random()}-${attachment.filename}`;
      const filePath = path.join(uploadDir, filename);
      
      await fs.writeFile(filePath, attachment.content);

      await EmailAttachment.create({
        emailId,
        filename,
        originalFilename: attachment.filename,
        filePath,
        fileSize: attachment.size || attachment.content.length,
        mimeType: attachment.contentType
      });
    }
  }

  async startEmailMonitoring() {
    console.log('E-posta izleme başlatılıyor...');
    
    const checkEmails = async () => {
      try {
        const newEmails = await this.fetchNewEmails();
        if (newEmails.length > 0) {
          console.log(`${newEmails.length} yeni mail işlendi`);
        }
      } catch (error) {
        console.error('Mail kontrol hatası:', error);
      }
    };

    await checkEmails();
    
    setInterval(checkEmails, 60000);
  }
}

module.exports = new EmailService();
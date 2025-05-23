const { Email } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class ConversationService {
  
  // Subject'i normalize et (Re:, Fwd: vb. prefixleri kaldır)
  normalizeSubject(subject) {
    if (!subject) return '';
    
    return subject
      .replace(/^(re|fwd|fw|ynt|ilet):\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Email adreslerinden domain çıkar
  getDomain(email) {
    if (!email) return '';
    return email.split('@')[1]?.toLowerCase() || '';
  }

  // Conversation ID oluştur
  generateConversationId(email1, email2, normalizedSubject) {
    // Email adreslerini alfabetik sıraya koy
    const emails = [email1, email2].sort();
    const conversationString = `${emails[0]}|${emails[1]}|${normalizedSubject}`;
    
    return crypto
      .createHash('md5')
      .update(conversationString)
      .digest('hex');
  }

  // Email için conversation bilgilerini tespit et
  async detectConversation(emailData) {
    const { senderEmail, subject } = emailData;
    const normalizedSubject = this.normalizeSubject(subject);
    const receiverEmail = 'gurkan.altay@iesyazilim.com.tr'; // Ana email adresi
    
    // Boş subject'ler için conversation oluşturma
    if (!normalizedSubject) {
      return {
        conversationId: null,
        threadSubject: subject || '',
        isConversationRoot: true
      };
    }

    // Bu sender ile olan mevcut conversation'ları ara
    const existingConversation = await Email.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { senderEmail },
              { senderEmail: receiverEmail }
            ]
          },
          { threadSubject: normalizedSubject },
          { conversationId: { [Op.ne]: null } }
        ]
      },
      order: [['dateReceived', 'ASC']]
    });

    if (existingConversation && existingConversation.conversationId) {
      // Mevcut conversation'a dahil et
      return {
        conversationId: existingConversation.conversationId,
        threadSubject: normalizedSubject,
        isConversationRoot: false
      };
    }

    // Yeni conversation oluştur
    const conversationId = this.generateConversationId(
      senderEmail,
      receiverEmail,
      normalizedSubject
    );

    return {
      conversationId,
      threadSubject: normalizedSubject,
      isConversationRoot: true
    };
  }

  // Conversation'ın tüm email'lerini getir
  async getConversationEmails(conversationId) {
    if (!conversationId) return [];

    return await Email.findAll({
      where: {
        conversationId
      },
      order: [['dateReceived', 'ASC']],
      include: ['attachments', 'readByUser', 'lastActionUser']
    });
  }

  // Mevcut email'leri conversation'lara organize et
  async organizeExistingEmails() {
    console.log('🔄 Mevcut email\'ler conversation\'lara organize ediliyor...');
    
    // Conversation bilgisi olmayan email'leri getir
    const unorganizedEmails = await Email.findAll({
      where: {
        conversationId: null
      },
      order: [['dateReceived', 'ASC']]
    });

    console.log(`📧 ${unorganizedEmails.length} email organize edilecek`);

    let organized = 0;
    const conversationMap = new Map();

    for (const email of unorganizedEmails) {
      const conversationInfo = await this.detectConversation({
        senderEmail: email.senderEmail,
        subject: email.subject
      });

      // Conversation bilgilerini güncelle
      await email.update(conversationInfo);

      // İstatistik tut
      const convId = conversationInfo.conversationId;
      if (convId) {
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, []);
        }
        conversationMap.get(convId).push(email.id);
      }

      organized++;
      
      if (organized % 50 === 0) {
        console.log(`📊 ${organized}/${unorganizedEmails.length} email organize edildi`);
      }
    }

    console.log(`✅ ${organized} email organize edildi`);
    console.log(`💬 ${conversationMap.size} conversation oluşturuldu`);

    return {
      organizedCount: organized,
      conversationCount: conversationMap.size
    };
  }

  // Conversation istatistikleri
  async getConversationStats() {
    const totalEmails = await Email.count();
    const conversationEmails = await Email.count({
      where: {
        conversationId: { [Op.ne]: null }
      }
    });
    
    const conversations = await Email.count({
      where: {
        isConversationRoot: true,
        conversationId: { [Op.ne]: null }
      }
    });

    return {
      totalEmails,
      conversationEmails,
      singleEmails: totalEmails - conversationEmails,
      conversations
    };
  }
}

module.exports = new ConversationService();
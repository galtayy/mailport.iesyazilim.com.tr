const { sequelize, Email } = require('../models');

async function createSameDomainEmails() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    const testEmails = [
      {
        messageId: 'test-domain-001@acmecorp.com',
        dateReceived: new Date('2025-01-20 09:30:00'),
        senderEmail: 'sales@acmecorp.com',
        senderName: 'Satış Departmanı',
        companyName: 'ACME Corporation',
        subject: 'Yeni ürün lansmanı',
        content: 'Yeni ürünümüzü tanıtmak isteriz...',
        htmlContent: null,
        hasAttachments: false,
        status: 'unread'
      },
      {
        messageId: 'test-domain-002@acmecorp.com',
        dateReceived: new Date('2025-01-20 11:15:00'),
        senderEmail: 'support@acmecorp.com',
        senderName: 'Teknik Destek',
        companyName: 'ACME Corporation',
        subject: 'Destek bildirimi',
        content: 'Sistem bakımı hakkında bilgilendirme...',
        htmlContent: null,
        hasAttachments: false,
        status: 'read'
      },
      {
        messageId: 'test-domain-003@acmecorp.com',
        dateReceived: new Date('2025-01-20 14:45:00'),
        senderEmail: 'hr@acmecorp.com',
        senderName: 'İnsan Kaynakları',
        companyName: 'ACME Corporation',
        subject: 'Personel duyurusu',
        content: 'Yeni personel alımı duyurusu...',
        htmlContent: null,
        hasAttachments: false,
        status: 'unread'
      },
      {
        messageId: 'test-domain-004@acmecorp.com',
        dateReceived: new Date('2025-01-21 08:20:00'),
        senderEmail: 'finance@acmecorp.com',
        senderName: 'Muhasebe',
        companyName: 'ACME Corporation',
        subject: 'Fatura bildirimi',
        content: 'Aylık fatura bilgilendirmesi...',
        htmlContent: null,
        hasAttachments: false,
        status: 'unread',
        isCompanyNameManual: false // Otomatik olarak çıkarılan firma adı
      }
    ];

    for (const emailData of testEmails) {
      const [email, created] = await Email.findOrCreate({
        where: { messageId: emailData.messageId },
        defaults: emailData
      });

      if (created) {
        console.log(`Test e-posta oluşturuldu: ${email.subject} (${email.senderEmail})`);
      } else {
        console.log(`Test e-posta zaten mevcut: ${email.subject} (${email.senderEmail})`);
      }
    }

    console.log('\nAynı domain\'den test e-postaları oluşturuldu!');
    console.log('Şimdi herhangi birinin firma adını değiştirip "Bu domain\'den gelen tüm mailleri güncelle" seçeneğini test edebilirsiniz.');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createSameDomainEmails();
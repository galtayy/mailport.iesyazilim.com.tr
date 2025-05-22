const { sequelize, Email, EmailAttachment } = require('../models');

async function createTestEmails() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    const testEmails = [
      {
        messageId: 'test-001@example.com',
        dateReceived: new Date('2025-01-20 10:30:00'),
        senderEmail: 'john.doe@acmecorp.com',
        senderName: 'John Doe',
        companyName: 'ACME Corporation',
        subject: 'Önizleme testi için örnek e-posta',
        content: `Merhaba,

Bu bir test e-postasıdır. Önizleme özelliğini test etmek için oluşturulmuştur.

Bu e-posta aşağıdaki bilgileri içerir:
- Tarih ve saat bilgisi
- Gönderen bilgileri
- Firma adı
- Konu
- İçerik

Saygılarımla,
John Doe
ACME Corporation`,
        htmlContent: `<div style="font-family: Arial, sans-serif;">
<h2>Merhaba,</h2>
<p>Bu bir <strong>test e-postasıdır</strong>. Önizleme özelliğini test etmek için oluşturulmuştur.</p>
<p>Bu e-posta aşağıdaki bilgileri içerir:</p>
<ul>
<li>Tarih ve saat bilgisi</li>
<li>Gönderen bilgileri</li>
<li>Firma adı</li>
<li>Konu</li>
<li>İçerik</li>
</ul>
<p>Saygılarımla,<br>
<strong>John Doe</strong><br>
<em>ACME Corporation</em></p>
</div>`,
        hasAttachments: false,
        status: 'unread'
      },
      {
        messageId: 'test-002@example.com',
        dateReceived: new Date('2025-01-20 14:15:00'),
        senderEmail: 'support@techsolutions.net',
        senderName: 'Tech Solutions Destek',
        companyName: 'Tech Solutions',
        subject: 'Destek talebi #12345',
        content: `Sayın Müşterimiz,

#12345 numaralı destek talebiniz için teşekkür ederiz.

Talebiniz incelemeye alınmış olup, en kısa sürede size dönüş yapılacaktır.

Bu süreçte herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.

İyi günler,
Tech Solutions Destek Ekibi`,
        htmlContent: null,
        hasAttachments: false,
        status: 'read'
      },
      {
        messageId: 'test-003@example.com',
        dateReceived: new Date('2025-01-21 09:00:00'),
        senderEmail: 'noreply@newsletter.com',
        senderName: 'Newsletter',
        companyName: 'Newsletter',
        subject: 'Haftalık bülten - Teknoloji haberleri',
        content: `Bu hafta teknoloji dünyasından öne çıkan haberler:

1. Yapay zeka gelişmeleri
2. Yeni yazılım güncellemeleri
3. Siber güvenlik uyarıları

Detaylar için web sitemizi ziyaret edin.`,
        htmlContent: `<div style="max-width: 600px; margin: 0 auto;">
<h1 style="color: #333;">Haftalık Teknoloji Bülteni</h1>
<p>Bu hafta teknoloji dünyasından öne çıkan haberler:</p>
<ol>
<li><strong>Yapay zeka gelişmeleri</strong></li>
<li><strong>Yeni yazılım güncellemeleri</strong></li>
<li><strong>Siber güvenlik uyarıları</strong></li>
</ol>
<p>Detaylar için <a href="#">web sitemizi</a> ziyaret edin.</p>
</div>`,
        hasAttachments: false,
        status: 'forwarded'
      }
    ];

    for (const emailData of testEmails) {
      const [email, created] = await Email.findOrCreate({
        where: { messageId: emailData.messageId },
        defaults: emailData
      });

      if (created) {
        console.log(`Test e-posta oluşturuldu: ${email.subject}`);
      } else {
        console.log(`Test e-posta zaten mevcut: ${email.subject}`);
      }
    }

    console.log('Test e-postaları başarıyla oluşturuldu!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createTestEmails();
const { sequelize } = require('../models');

async function addConversationFields() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Mevcut emails tablosu şemasını kontrol et
    console.log('Emails tablosu şeması kontrol ediliyor...');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'emails'
      ORDER BY ORDINAL_POSITION
    `);

    const existingColumns = results.map(row => row.COLUMN_NAME);
    console.log('Mevcut kolonlar:', existingColumns);

    const requiredColumns = [
      'conversation_id',
      'thread_subject', 
      'is_conversation_root'
    ];

    console.log('\nConversation kolonları kontrol ediliyor...');
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`❌ Eksik kolon: ${column}`);
        
        let alterQuery = '';
        switch (column) {
          case 'conversation_id':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN conversation_id VARCHAR(255) NULL,
              ADD INDEX idx_conversation_id (conversation_id)
            `;
            break;
          case 'thread_subject':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN thread_subject VARCHAR(500) NULL
            `;
            break;
          case 'is_conversation_root':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN is_conversation_root BOOLEAN DEFAULT TRUE,
              ADD INDEX idx_is_conversation_root (is_conversation_root)
            `;
            break;
        }
        
        console.log(`Kolon ekleniyor: ${column}`);
        await sequelize.query(alterQuery);
        console.log(`✅ ${column} kolonu eklendi`);
      } else {
        console.log(`✅ Mevcut: ${column}`);
      }
    }

    console.log('\n🎉 Conversation alanları başarıyla eklendi!');
    console.log('\nŞimdi conversation organize işlemini çalıştırabilirsin:');
    console.log('POST /api/emails/conversations/organize');

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addConversationFields();
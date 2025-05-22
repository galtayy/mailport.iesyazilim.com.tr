const sequelize = require('../config/database');

async function addUserTrackingColumns() {
  try {
    console.log('Kullanıcı takip sütunları ekleniyor...');
    
    // Her sütunu ayrı ayrı ekle
    try {
      await sequelize.query('ALTER TABLE emails ADD COLUMN read_by_user_id INT');
      console.log('read_by_user_id sütunu eklendi');
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) throw e;
      console.log('read_by_user_id sütunu zaten mevcut');
    }

    try {
      await sequelize.query('ALTER TABLE emails ADD COLUMN read_at DATETIME');
      console.log('read_at sütunu eklendi');
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) throw e;
      console.log('read_at sütunu zaten mevcut');
    }

    try {
      await sequelize.query('ALTER TABLE emails ADD COLUMN last_action_user_id INT');
      console.log('last_action_user_id sütunu eklendi');
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) throw e;
      console.log('last_action_user_id sütunu zaten mevcut');
    }

    try {
      await sequelize.query('ALTER TABLE emails ADD COLUMN last_action_at DATETIME');
      console.log('last_action_at sütunu eklendi');
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) throw e;
      console.log('last_action_at sütunu zaten mevcut');
    }
    
    console.log('Sütunlar başarıyla eklendi!');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

addUserTrackingColumns();
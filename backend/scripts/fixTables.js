const { sequelize, Email, EmailAttachment, ActionLog, User } = require('../models');

async function fixTables() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Tüm tabloları oluştur/güncelle
    await sequelize.sync({ alter: true });
    console.log('Tüm tablolar senkronize edildi');

    console.log('Tablolar başarıyla güncellendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

fixTables();
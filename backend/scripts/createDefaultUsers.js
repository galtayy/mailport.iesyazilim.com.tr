const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

async function createDefaultUsers() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Users tablosunu oluştur
    await User.sync({ force: false });
    console.log('Users tablosu senkronize edildi');

    // Varsayılan kullanıcıları oluştur
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('123456', saltRounds);

    const users = [
      {
        username: 'admin',
        email: 'admin@mailport.com',
        password: hashedPassword,
        fullName: 'Sistem Yöneticisi',
        role: 'admin'
      },
      {
        username: 'destek',
        email: 'destek@mailport.com',
        password: hashedPassword,
        fullName: 'Destek Personeli',
        role: 'destek'
      }
    ];

    for (const userData of users) {
      const [user, created] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData
      });

      if (created) {
        console.log(`Kullanıcı oluşturuldu: ${user.username}`);
      } else {
        console.log(`Kullanıcı zaten mevcut: ${user.username}`);
      }
    }

    console.log('Varsayılan kullanıcılar başarıyla oluşturuldu!');
    console.log('Giriş bilgileri:');
    console.log('Admin: admin / 123456');
    console.log('Destek: destek / 123456');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createDefaultUsers();
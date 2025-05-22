const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function updateUsers() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    const saltRounds = 12;
    const plainPassword = '123456';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('Yeni hash:', hashedPassword);

    // Admin kullanıcısını güncelle
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      await adminUser.update({ password: hashedPassword });
      console.log('Admin kullanıcısı güncellendi');
    }

    // Destek kullanıcısını güncelle
    const destekUser = await User.findOne({ where: { username: 'destek' } });
    if (destekUser) {
      await destekUser.update({ password: hashedPassword });
      console.log('Destek kullanıcısı güncellendi');
    }

    // Test et
    const testUser = await User.findOne({ where: { username: 'admin' } });
    const isValid = await testUser.validatePassword('123456');
    console.log('Şifre testi sonucu:', isValid);

    console.log('Kullanıcılar başarıyla güncellendi!');
    console.log('Giriş bilgileri:');
    console.log('Admin: admin / 123456');
    console.log('Destek: destek / 123456');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

updateUsers();
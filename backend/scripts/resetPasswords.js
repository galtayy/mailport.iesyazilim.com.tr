const { sequelize, User } = require('../models');

async function resetPasswords() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Admin kullanıcısını güncelle
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      await adminUser.update({ password: '123456' });
      console.log('Admin şifresi sıfırlandı');
      
      // Test et
      const testResult = await adminUser.validatePassword('123456');
      console.log('Admin şifre testi:', testResult);
    }

    // Destek kullanıcısını güncelle
    const destekUser = await User.findOne({ where: { username: 'destek' } });
    if (destekUser) {
      await destekUser.update({ password: '123456' });
      console.log('Destek şifresi sıfırlandı');
      
      // Test et
      const testResult = await destekUser.validatePassword('123456');
      console.log('Destek şifre testi:', testResult);
    }

    console.log('Şifreler başarıyla sıfırlandı!');
    console.log('Giriş bilgileri:');
    console.log('Admin: admin / 123456');
    console.log('Destek: destek / 123456');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

resetPasswords();
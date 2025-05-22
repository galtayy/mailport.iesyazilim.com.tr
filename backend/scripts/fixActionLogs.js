const { sequelize, ActionLog, User } = require('../models');

async function fixActionLogs() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Admin kullanıcısını bul
    const adminUser = await User.findOne({ 
      where: { role: 'admin' },
      order: [['id', 'ASC']]
    });

    if (!adminUser) {
      console.log('Admin kullanıcı bulunamadı');
      return;
    }

    console.log('Admin kullanıcı:', adminUser.fullName, '(ID:', adminUser.id + ')');

    // userId'si null olan action logs'ları bul
    const nullUserLogs = await ActionLog.findAll({
      where: { userId: null },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName'],
          required: false
        }
      ]
    });

    console.log(`userId'si null olan ${nullUserLogs.length} log kaydı bulundu`);

    if (nullUserLogs.length > 0) {
      // Bu kayıtları admin kullanıcısına ata
      const updateResult = await ActionLog.update(
        { userId: adminUser.id },
        { where: { userId: null } }
      );

      console.log(`${updateResult[0]} log kaydı admin kullanıcısına atandı`);
    }

    // Son durumu kontrol et
    const totalLogs = await ActionLog.count();
    const logsWithUser = await ActionLog.count({
      where: { userId: { [require('sequelize').Op.ne]: null } }
    });

    console.log(`Toplam log: ${totalLogs}, Kullanıcılı log: ${logsWithUser}`);

    // Tüm kullanıcıları listele
    const users = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'role'],
      order: [['id', 'ASC']]
    });

    console.log('\nMevcut kullanıcılar:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.fullName}) - ${user.role} - ID: ${user.id}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

fixActionLogs();
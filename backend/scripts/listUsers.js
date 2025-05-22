const { sequelize, User, ActionLog } = require('../models');

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Tüm kullanıcıları listele
    const users = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'role', 'isActive'],
      order: [['id', 'ASC']]
    });

    console.log('\n=== MEVCUT KULLANICILAR ===');
    users.forEach(user => {
      console.log(`ID: ${user.id} | ${user.username} | ${user.fullName} | ${user.role} | ${user.isActive ? 'Aktif' : 'Pasif'}`);
    });

    // ActionLog'lardaki kullanıcı dağılımını göster
    console.log('\n=== ACTION LOG KULLANICI DAĞILIMI ===');
    const logStats = await ActionLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('ActionLog.id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['fullName'],
          required: false
        }
      ],
      group: ['userId', 'user.id'],
      order: [['userId', 'ASC']]
    });

    logStats.forEach(stat => {
      const userName = stat.user ? stat.user.fullName : 'Bilinmeyen Kullanıcı';
      console.log(`UserID: ${stat.userId || 'NULL'} | ${userName} | ${stat.dataValues.count} log`);
    });

    // En son action log'ları göster
    console.log('\n=== SON 10 ACTION LOG ===');
    const recentLogs = await ActionLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['fullName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentLogs.forEach(log => {
      const userName = log.user ? log.user.fullName : 'Bilinmeyen Kullanıcı';
      console.log(`${log.createdAt.toISOString()} | ${log.actionType} | UserID: ${log.userId} | ${userName}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

listUsers();
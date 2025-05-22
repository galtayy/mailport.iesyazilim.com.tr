const { sequelize, ActionLog, User } = require('../models');

async function fixOrphanLogs() {
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

    // Orphan log'ları bul (userId değeri var ama o kullanıcı mevcut değil)
    const orphanLogs = await ActionLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          required: false
        }
      ],
      where: {
        userId: { [require('sequelize').Op.ne]: null }
      }
    });

    const orphanUserIds = [];
    orphanLogs.forEach(log => {
      if (!log.user && !orphanUserIds.includes(log.userId)) {
        orphanUserIds.push(log.userId);
      }
    });

    console.log('Orphan kullanıcı ID\'leri:', orphanUserIds);

    for (const orphanUserId of orphanUserIds) {
      const count = await ActionLog.count({
        where: { userId: orphanUserId }
      });
      
      console.log(`UserID ${orphanUserId} için ${count} log kaydı bulundu`);
      
      // Bu kayıtları admin kullanıcısına ata
      const updateResult = await ActionLog.update(
        { userId: adminUser.id },
        { where: { userId: orphanUserId } }
      );

      console.log(`UserID ${orphanUserId} -> ${adminUser.id} olarak güncellendi (${updateResult[0]} kayıt)`);
    }

    console.log('Orphan loglar düzeltildi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

fixOrphanLogs();
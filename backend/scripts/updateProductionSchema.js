const { sequelize } = require('../models');

async function updateProductionSchema() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı');

    // Mevcut emails tablosu şemasını kontrol et
    console.log('Mevcut emails tablosu şeması kontrol ediliyor...');
    
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
      'read_by_user_id',
      'read_at', 
      'last_action_user_id',
      'last_action_at'
    ];

    console.log('\nGerekli kolonlar kontrol ediliyor...');
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`❌ Eksik kolon: ${column}`);
        
        let alterQuery = '';
        switch (column) {
          case 'read_by_user_id':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN read_by_user_id INT NULL,
              ADD FOREIGN KEY (read_by_user_id) REFERENCES users(id)
            `;
            break;
          case 'read_at':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN read_at DATETIME NULL
            `;
            break;
          case 'last_action_user_id':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN last_action_user_id INT NULL,
              ADD FOREIGN KEY (last_action_user_id) REFERENCES users(id)
            `;
            break;
          case 'last_action_at':
            alterQuery = `
              ALTER TABLE emails 
              ADD COLUMN last_action_at DATETIME NULL
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

    // Action logs tablosunu kontrol et
    console.log('\nAction logs tablosu kontrol ediliyor...');
    
    const [actionLogResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'action_logs'
      ORDER BY ORDINAL_POSITION
    `);

    const actionLogColumns = actionLogResults.map(row => row.COLUMN_NAME);
    console.log('Action logs kolonları:', actionLogColumns);

    if (!actionLogColumns.includes('user_id')) {
      console.log('❌ action_logs tablosunda user_id kolonu eksik');
      await sequelize.query(`
        ALTER TABLE action_logs 
        ADD COLUMN user_id INT NULL,
        ADD FOREIGN KEY (user_id) REFERENCES users(id)
      `);
      console.log('✅ user_id kolonu action_logs tablosuna eklendi');
    } else {
      console.log('✅ action_logs.user_id mevcut');
    }

    // Users tablosunu kontrol et
    console.log('\nUsers tablosu kontrol ediliyor...');
    
    const [userResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM users
    `);
    
    console.log(`Users tablosunda ${userResults[0].count} kullanıcı var`);

    if (userResults[0].count === 0) {
      console.log('Varsayılan kullanıcılar oluşturuluyor...');
      
      // bcryptjs ile hash oluştur
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      await sequelize.query(`
        INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
        VALUES 
        ('admin', 'admin@mailport.com', '${hashedPassword}', 'Sistem Yöneticisi', 'admin', 1, NOW(), NOW()),
        ('destek', 'destek@mailport.com', '${hashedPassword}', 'Destek Personeli', 'destek', 1, NOW(), NOW())
      `);
      
      console.log('✅ Varsayılan kullanıcılar oluşturuldu');
      console.log('Giriş bilgileri:');
      console.log('Admin: admin / 123456');
      console.log('Destek: destek / 123456');
    }

    console.log('\n🎉 Veritabanı şeması başarıyla güncellendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

updateProductionSchema();
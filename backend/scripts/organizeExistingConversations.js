const conversationService = require('../services/conversationService');
const { sequelize } = require('../models');

async function organizeExistingConversations() {
  console.log('🚀 Mevcut email\'leri conversation\'lara organize etme işlemi başlıyor...\n');
  
  try {
    // Veritabanı bağlantısını kontrol et
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı\n');
    
    // İstatistikleri göster (öncesi)
    console.log('📊 Mevcut durum:');
    const beforeStats = await conversationService.getConversationStats();
    console.log(`  - Toplam email: ${beforeStats.totalEmails}`);
    console.log(`  - Conversation\'lı email: ${beforeStats.conversationEmails}`);
    console.log(`  - Tekil email: ${beforeStats.singleEmails}`);
    console.log(`  - Conversation sayısı: ${beforeStats.conversations}\n`);
    
    // Organize et
    const result = await conversationService.organizeExistingEmails();
    
    console.log('\n📊 İşlem sonucu:');
    console.log(`  - Organize edilen email: ${result.organizedCount}`);
    console.log(`  - Oluşturulan conversation: ${result.conversationCount}\n`);
    
    // İstatistikleri göster (sonrası)
    console.log('📊 Güncellenen durum:');
    const afterStats = await conversationService.getConversationStats();
    console.log(`  - Toplam email: ${afterStats.totalEmails}`);
    console.log(`  - Conversation\'lı email: ${afterStats.conversationEmails}`);
    console.log(`  - Tekil email: ${afterStats.singleEmails}`);
    console.log(`  - Conversation sayısı: ${afterStats.conversations}`);
    
    console.log('\n✅ İşlem başarıyla tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await sequelize.close();
  }
}

// Script'i çalıştır
organizeExistingConversations();
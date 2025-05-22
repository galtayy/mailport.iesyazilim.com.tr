const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = '123456';
  const dbHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A3/VTbZhG';
  
  console.log('Plain password:', plainPassword);
  console.log('DB hash:', dbHash);
  
  try {
    const isValid = await bcrypt.compare(plainPassword, dbHash);
    console.log('Password validation result:', isValid);
    
    // Yeni hash oluşturalım
    const newHash = await bcrypt.hash(plainPassword, 12);
    console.log('New hash:', newHash);
    
    const isNewValid = await bcrypt.compare(plainPassword, newHash);
    console.log('New hash validation:', isNewValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
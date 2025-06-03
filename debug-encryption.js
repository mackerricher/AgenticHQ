import crypto from 'crypto';

// Test encryption with same method as the app
function testEncryption() {
  console.log('Testing encryption...');
  
  const masterKey = process.env.MASTER_SECRET || "fallback-key-for-development-only";
  console.log(`Master key length: ${masterKey.length}`);
  
  const testText = "sk-test123456789";
  console.log(`Test text: ${testText}`);
  
  try {
    // Encryption
    const iv = crypto.randomBytes(16);
    console.log(`IV: ${iv.toString('hex')}`);
    
    const key = crypto.scryptSync(masterKey, 'salt', 32);
    console.log(`Derived key length: ${key.length}`);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    console.log('Cipher created successfully');
    
    const encrypted = Buffer.concat([cipher.update(testText, 'utf8'), cipher.final()]);
    console.log(`Encrypted length: ${encrypted.length}`);
    
    const authTag = cipher.getAuthTag();
    console.log(`Auth tag length: ${authTag.length}`);
    
    const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
    console.log(`Final result: ${result.substring(0, 50)}...`);
    
    // Test decryption
    const parts = result.split(':');
    const decIv = Buffer.from(parts[0], 'hex');
    const decAuthTag = Buffer.from(parts[1], 'hex');
    const decEncrypted = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, decIv);
    decipher.setAuthTag(decAuthTag);
    
    const decrypted = Buffer.concat([decipher.update(decEncrypted), decipher.final()]);
    const decryptedText = decrypted.toString('utf8');
    
    console.log(`Decrypted: ${decryptedText}`);
    console.log(`Match: ${decryptedText === testText}`);
    
    console.log('✅ Encryption test passed!');
    
  } catch (error) {
    console.error('❌ Encryption test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testEncryption();
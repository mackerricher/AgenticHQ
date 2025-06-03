import crypto from "crypto";
import { storage } from "./storage";

class SecretService {
  private masterKey: string;
  private cache: Map<string, string> = new Map();

  constructor() {
    this.masterKey = process.env.MASTER_SECRET || "fallback-key-for-development-only";
    if (this.masterKey === "fallback-key-for-development-only") {
      console.warn("WARNING: Using fallback master key. Set MASTER_SECRET environment variable for production.");
    }
  }

  private encrypt(text: string): string {
    try {
      console.log(`[DEBUG] Starting encryption for text length: ${text.length}`);
      console.log(`[DEBUG] Master key length: ${this.masterKey.length}`);
      
      const iv = crypto.randomBytes(16);
      console.log(`[DEBUG] Generated IV: ${iv.toString('hex')}`);
      
      const key = crypto.scryptSync(this.masterKey, 'salt', 32);
      console.log(`[DEBUG] Derived key length: ${key.length}`);
      
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      console.log(`[DEBUG] Created cipher`);
      
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      console.log(`[DEBUG] Encrypted text length: ${encrypted.length}`);
      
      const authTag = cipher.getAuthTag();
      console.log(`[DEBUG] Generated auth tag length: ${authTag.length}`);
      
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
      console.log(`[DEBUG] Final encrypted string length: ${result.length}`);
      
      return result;
    } catch (error) {
      console.error('[ERROR] Encryption error:', error);
      console.error('[ERROR] Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('[ERROR] Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    
    const key = crypto.scryptSync(this.masterKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  async getKey(provider: string): Promise<string | null> {
    // Check database first (skip cache to ensure fresh data)
    const secret = await storage.getSecret(provider);
    if (secret) {
      try {
        const decryptedKey = this.decrypt(secret.encryptedKey);
        this.cache.set(provider, decryptedKey);
        return decryptedKey;
      } catch (error) {
        console.error(`Failed to decrypt key for provider ${provider}:`, error);
        this.cache.delete(provider); // Clear cache on decrypt error
        return null;
      }
    }

    // Fallback to environment variables
    const envKey = process.env[`${provider.toUpperCase()}_API_KEY`] || 
                   process.env[`${provider.toUpperCase()}_KEY`] ||
                   process.env[`${provider}_API_KEY`] ||
                   process.env[`${provider}_KEY`];
    
    return envKey || null;
  }

  async setKey(provider: string, rawKey: string): Promise<void> {
    try {
      const encryptedKey = this.encrypt(rawKey);
      const keyPreview = rawKey.substring(0, 6);
      
      const existing = await storage.getSecret(provider);
      if (existing) {
        await storage.updateSecret(provider, encryptedKey, keyPreview);
      } else {
        await storage.createSecret({ provider, encryptedKey, keyPreview });
      }
      
      // Update cache
      this.cache.set(provider, rawKey);
    } catch (error) {
      console.error(`Failed to set key for provider ${provider}:`, error);
      throw new Error(`Failed to encrypt and store API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteKey(provider: string): Promise<void> {
    await storage.deleteSecret(provider);
    this.cache.delete(provider);
  }

  async hasKey(provider: string): Promise<{ hasKey: boolean; updatedAt?: Date; keyPreview?: string }> {
    const secret = await storage.getSecret(provider);
    if (secret) {
      return { hasKey: true, updatedAt: secret.updatedAt, keyPreview: secret.keyPreview };
    }
    
    // Check environment variables
    const envKey = await this.getKey(provider);
    return { hasKey: !!envKey };
  }
}

export const secretService = new SecretService();

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
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.masterKey);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.masterKey);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  async getKey(provider: string): Promise<string | null> {
    // Check cache first
    if (this.cache.has(provider)) {
      return this.cache.get(provider)!;
    }

    // Check database
    const secret = await storage.getSecret(provider);
    if (secret) {
      try {
        const decryptedKey = this.decrypt(secret.encryptedKey);
        this.cache.set(provider, decryptedKey);
        return decryptedKey;
      } catch (error) {
        console.error(`Failed to decrypt key for provider ${provider}:`, error);
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

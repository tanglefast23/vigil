/**
 * Encryption utilities for securing OAuth tokens at rest
 * Uses AES-256-GCM for authenticated encryption
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is not set');
  }
  if (key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  return Buffer.from(key, 'hex');
}

interface EncryptedData {
  encrypted: string;
  authTag: string;
  iv: string;
}

export function encrypt(text: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    authTag: cipher.getAuthTag().toString('hex'),
    iv: iv.toString('hex'),
  };
}

export function decrypt(data: EncryptedData): string {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(data.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Serialize a token for database storage
 * Returns a JSON string containing encrypted data + IV + auth tag
 */
export function serializeToken(token: string): string {
  const encryptedData = encrypt(token);
  return JSON.stringify(encryptedData);
}

/**
 * Deserialize and decrypt a token from database storage
 */
export function deserializeToken(serialized: string): string {
  const data: EncryptedData = JSON.parse(serialized);
  return decrypt(data);
}

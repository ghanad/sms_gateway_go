import crypto from 'crypto';

const keyHex = process.env.PROVIDER_KMS_KEY || '0000000000000000000000000000000000000000000000000000000000000000';
const key = Buffer.from(keyHex, 'hex');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.slice(0,12);
  const tag = data.slice(12,28);
  const text = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(text), decipher.final()]);
  return dec.toString('utf8');
}

export function maskSecret(str?: string): string {
  if (!str) return '';
  return '****' + str.slice(-4);
}

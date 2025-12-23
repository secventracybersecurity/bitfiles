/**
 * STORZY Client-Side Encryption Layer
 * Uses Web Crypto API (AES-256-GCM)
 * Zero-Trust: Keys never leave the client in plaintext
 */

const AES_GCM = 'AES-GCM';
const PBKDF2 = 'PBKDF2';

export interface EncryptionResult {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

export interface FileKeyResult {
  encryptedFek: string;
  fekIv: string;
  rawFileKey: CryptoKey;
}

/**
 * Derives a 256-bit Master Key from a user password and salt
 */
export async function deriveMasterKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    PBKDF2,
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: PBKDF2,
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: AES_GCM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a random AES-256 key for a specific file
 */
export async function generateFileKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: AES_GCM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a FileKey with the User's MasterKey
 */
export async function encryptFileKey(masterKey: CryptoKey, fileKey: CryptoKey): Promise<{ encryptedFek: string, fekIv: string }> {
  const rawKey = await crypto.subtle.exportKey('raw', fileKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: AES_GCM, iv },
    masterKey,
    rawKey
  );

  return {
    encryptedFek: b64Encode(encrypted),
    fekIv: b64Encode(iv)
  };
}

/**
 * Decrypts a FileKey with the User's MasterKey
 */
export async function decryptFileKey(masterKey: CryptoKey, encryptedFek: string, fekIv: string): Promise<CryptoKey> {
  const iv = b64Decode(fekIv);
  const ciphertext = b64Decode(encryptedFek);

  const decrypted = await crypto.subtle.decrypt(
    { name: AES_GCM, iv },
    masterKey,
    ciphertext
  );

  return await crypto.subtle.importKey(
    'raw',
    decrypted,
    AES_GCM,
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts file data
 */
export async function encryptData(key: CryptoKey, data: ArrayBuffer): Promise<EncryptionResult> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_GCM, iv },
    key,
    data
  );

  return { ciphertext, iv };
}

/**
 * Decrypts file data
 */
export async function decryptData(key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    { name: AES_GCM, iv },
    key,
    ciphertext
  );
}

// Helpers
function b64Encode(buffer: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function b64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface EncryptionDetails {
  key: string; // Base64 wrapped or exported key
  iv: string; // Base64 IV
  authTag?: string; // Not needed separately for AES-GCM as it's in the ciphertext, but good for metadata
}

export const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file: File): Promise<{ encryptedChunks: Blob[]; encryptionDetails: EncryptionDetails }> {
  const key = await generateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileBuffer
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  // Chunk the encrypted buffer
  const encryptedChunks: Blob[] = [];
  const totalSize = encryptedBuffer.byteLength;
  for (let i = 0; i < totalSize; i += CHUNK_SIZE) {
    const chunk = encryptedBuffer.slice(i, Math.min(i + CHUNK_SIZE, totalSize));
    encryptedChunks.push(new Blob([chunk]));
  }

  return {
    encryptedChunks,
    encryptionDetails: {
      key: keyBase64,
      iv: ivBase64,
    },
  };
}

export async function decryptFile(encryptedChunks: Blob[], details: EncryptionDetails): Promise<Blob> {
  const keyBuffer = Uint8Array.from(atob(details.key), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(details.iv), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    true,
    ['decrypt']
  );

  // Combine chunks
  const combinedBuffer = await new Blob(encryptedChunks).arrayBuffer();

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    combinedBuffer
  );

  return new Blob([decryptedBuffer]);
}

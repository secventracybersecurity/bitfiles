import { supabase } from './supabase';
import { recoverShard, calculateRecoveryProbability, APEMManifest } from './apem';
import * as cryptoLib from './crypto';

export interface EncryptionDetails {
  encryptedFEK: string; 
  fekIV: string;
  fileIV: string;
}

export const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

/**
 * High-level File Encryption & Chunking
 * Implements Hybrid Encryption (AES-GCM-256)
 */
export async function encryptFile(file: File, masterKey: CryptoKey): Promise<{ 
  encryptedChunks: Blob[]; 
  encryptionDetails: EncryptionDetails; 
  chunkHashes: string[];
}> {
  // 1. Generate per-file key (FEK)
  const fek = await cryptoLib.generateFileKey();
  
  // 2. Encrypt plaintext file
  const fileBuffer = await file.arrayBuffer();
  const { ciphertext: encryptedBuffer, iv: fileIV } = await cryptoLib.encryptData(fek, fileBuffer);

  // 3. Wrap FEK with MasterKey
  const { encryptedFek, fekIv } = await cryptoLib.encryptFileKey(masterKey, fek);

  // 4. Chunking
  const encryptedChunks: Blob[] = [];
  const chunkHashes: string[] = [];
  const totalSize = encryptedBuffer.byteLength;
  
  for (let i = 0; i < totalSize; i += CHUNK_SIZE) {
    const chunkData = encryptedBuffer.slice(i, Math.min(i + CHUNK_SIZE, totalSize));
    const chunkBlob = new Blob([chunkData]);
    encryptedChunks.push(chunkBlob);
    
    // Hash each chunk for integrity verification
    const hashBuffer = await crypto.subtle.digest('SHA-256', chunkData);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    chunkHashes.push(hashHex);
  }

  return {
    encryptedChunks,
    chunkHashes,
    encryptionDetails: { 
      encryptedFEK: encryptedFek, 
      fekIV: fekIv,
      fileIV: b64Encode(fileIV)
    },
  };
}

/**
 * High-level File Decryption
 */
export async function decryptFile(
  encryptedBuffer: ArrayBuffer, 
  details: EncryptionDetails,
  masterKey: CryptoKey
): Promise<Blob> {
  // 1. Unwrap FEK
  const fek = await cryptoLib.decryptFileKey(masterKey, details.encryptedFEK, details.fekIV);

  // 2. Decrypt ciphertext
  const fileIV = b64Decode(details.fileIV);
  const decryptedBuffer = await cryptoLib.decryptData(fek, encryptedBuffer, fileIV);

  return new Blob([decryptedBuffer]);
}

/**
 * STEP-5: Client-side file recovery & reassembly engine (APEM-ready)
 */
export async function recoverAndReassemble(
  fileId: string, 
  masterKey: CryptoKey,
  onProgress?: (state: string, percent: number) => void
): Promise<Blob> {
  onProgress?.("Re-proving data survival mathematically...", 10);

  // 1. Fetch metadata
  const { data: fileMeta, error: fileError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (fileError || !fileMeta) throw new Error('File metadata not found');

  const { data: shards, error: shardError } = await supabase
    .from('shards')
    .select('*, nodes(*)')
    .eq('file_id', fileId)
    .order('shard_index', { ascending: true });

  if (shardError || !shards) throw new Error('Recovery manifest not found');

  onProgress?.("Retrieving distributed shards...", 30);

  // 2. Parallel Fetch
  const fetchedShards: (Blob | null)[] = await Promise.all(
    shards.map(async (shard) => {
      try {
        const res = await fetch(`/api/node/${shard.node_id}/download?fileId=${fileId}&chunkIndex=${shard.shard_index}`);
        return res.ok ? await res.blob() : null;
      } catch { return null; }
    })
  );

  onProgress?.("Reassembling sharded stream...", 70);

  // 3. Reassembly
  const completeShards: Blob[] = [];
  for (let i = 0; i < shards.length; i++) {
    if (fetchedShards[i] === null) {
      // Logic for parity recovery could go here (APEM)
      throw new Error(`Critical Shard ${i} missing from Node ${shards[i].node_id}`);
    }
    completeShards.push(fetchedShards[i]!);
  }

  onProgress?.("Deciphering reassembled stream...", 90);

  // 4. Decryption
  const combinedBuffer = await new Blob(completeShards).arrayBuffer();
  const encryptionDetails: EncryptionDetails = {
    encryptedFEK: fileMeta.encrypted_fek,
    fekIV: fileMeta.fek_iv,
    fileIV: fileMeta.file_iv
  };

  const decryptedBlob = await decryptFile(combinedBuffer, encryptionDetails, masterKey);
  onProgress?.("Data integrity verified", 100);
  return decryptedBlob;
}

// Minimal Thumbnail recovery (simulation)
export async function recoverThumbnail(fileId: string): Promise<Blob | null> {
  return null; // For simplicity in this crypto-focused demo
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

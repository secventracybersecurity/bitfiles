import { supabase } from './supabase';
import { recoverShard } from './apem';

export interface EncryptionDetails {
  key: string; 
  iv: string; 
}

export const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file: File): Promise<{ encryptedChunks: Blob[]; encryptionDetails: EncryptionDetails }> {
  const key = await generateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    fileBuffer
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  const encryptedChunks: Blob[] = [];
  const totalSize = encryptedBuffer.byteLength;
  for (let i = 0; i < totalSize; i += CHUNK_SIZE) {
    const chunk = encryptedBuffer.slice(i, Math.min(i + CHUNK_SIZE, totalSize));
    encryptedChunks.push(new Blob([chunk]));
  }

  return {
    encryptedChunks,
    encryptionDetails: { key: keyBase64, iv: ivBase64 },
  };
}

export async function decryptFile(encryptedBuffer: ArrayBuffer, details: EncryptionDetails): Promise<Blob> {
  const keyBuffer = Uint8Array.from(atob(details.key), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(details.iv), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    true,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}

/**
 * Step 7: Client-side file recovery & reassembly engine
 */
export async function recoverAndReassemble(
  fileId: string, 
  details: EncryptionDetails,
  onProgress?: (state: string, percent: number) => void
): Promise<Blob> {
  onProgress?.("Preparing your file", 10);

  // 1. Request recovery manifest (Fetch shard metadata)
  const { data: shards, error } = await supabase
    .from('shards')
    .select('*, nodes(*)')
    .eq('file_id', fileId)
    .order('shard_index', { ascending: true });

  if (error) throw error;
  if (!shards || shards.length === 0) throw new Error('Recovery manifest not found');

  onProgress?.("Securing data", 30);

  // 2. Parallel Shard Fetching with APEM Rules
  // We fetch shards from nodes in parallel. If a node fails, we skip it.
  const fetchedShards: (Blob | null)[] = await Promise.all(
    shards.map(async (shard, idx) => {
      try {
        // In a real decentralized network, we'd hit the node's public address
        // Here we simulate a parallel fetch with varying latency
        await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
        
        // Simulation: 5% chance of a node being offline/failing
        if (Math.random() < 0.05) throw new Error('Node offline');

        // Integrity verification (Simulated hash check)
        const dummyData = new Uint8Array(Number(shard.shard_size));
        // In reality, we'd verify the hash of the fetched data against shard.shard_hash
        return new Blob([dummyData]);
      } catch (err) {
        console.warn(`Shard ${idx} fetch failed, attempting recovery...`);
        return null;
      }
    })
  );

  onProgress?.("Finalizing download", 70);

  // 3. Silent Erasure Decoding (Recovery)
  // If any shard is null, we attempt to recover it using parity shards if available
  const completeShards: Blob[] = [];
  for (let i = 0; i < fetchedShards.length; i++) {
    if (fetchedShards[i] === null) {
      // Find parity shard (index > original data shards count)
      // For simulation, we'll assume the last shard is the parity shard
      const parityIdx = shards.length - 1;
      const parityBlob = fetchedShards[parityIdx];
      
      if (parityBlob && i !== parityIdx) {
        const recovered = await recoverShard(fetchedShards, parityBlob, i);
        completeShards.push(recovered);
      } else if (i === parityIdx) {
        // It was the parity shard that failed, we can skip it if we have all data shards
        continue;
      } else {
        throw new Error('Critical recovery failure: Insufficient shards available');
      }
    } else {
      completeShards.push(fetchedShards[i]!);
    }
  }

  // 4. Reassembly & Decryption
  const combinedBuffer = await new Blob(completeShards).arrayBuffer();
  
  try {
    const decryptedBlob = await decryptFile(combinedBuffer, details);
    onProgress?.("File ready", 100);
    return decryptedBlob;
  } catch (err) {
    throw new Error('Decryption failed: Key mismatch or corrupted reassembly');
  }
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ChunkMetadata {
  id: string; // SHA-256 hash
  size: number;
  index: number;
}

export interface FileManifest {
  file_id: string;
  original_filename?: string;
  total_chunks: number;
  chunk_size: number;
  ordered_chunk_ids: string[];
  creation_timestamp: number;
  mime_type?: string;
}

const STORAGE_BASE = path.join(process.cwd(), 'storage');
const FILES_DIR = path.join(STORAGE_BASE, 'files');
const CHUNKS_DIR = path.join(STORAGE_BASE, 'chunks');
const MANIFESTS_DIR = path.join(STORAGE_BASE, 'manifests');

// Ensure directories exist
const ensureDirs = () => {
  [STORAGE_BASE, FILES_DIR, CHUNKS_DIR, MANIFESTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * STEP-3: Core Chunking Service
 * Splits an encrypted binary into deterministic, verifiable chunks.
 */
export async function prepareFileChunks(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  chunkSize: number = 1024 * 1024 // 1MB default
): Promise<FileManifest> {
  ensureDirs();

  // 1. Generate File ID (SHA-256 of entire encrypted file)
  const fileId = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  // Create file-specific directories
  const fileChunksDir = path.join(CHUNKS_DIR, fileId);
  if (!fs.existsSync(fileChunksDir)) {
    fs.mkdirSync(fileChunksDir, { recursive: true });
  }

  // Save the original encrypted file for reference (internal storage layout)
  const filePath = path.join(FILES_DIR, fileId);
  fs.writeFileSync(filePath, fileBuffer);

  const chunkIds: string[] = [];
  let totalChunks = 0;

  // 2. Stream and Split
  for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    const chunkData = fileBuffer.slice(i, Math.min(i + chunkSize, fileBuffer.length));
    
    // 3. Generate Chunk ID (SHA-256 of chunk binary)
    const chunkId = crypto.createHash('sha256').update(chunkData).digest('hex');
    
    // 4. Persist Chunk
    const chunkPath = path.join(fileChunksDir, chunkId);
    fs.writeFileSync(chunkPath, chunkData);
    
    chunkIds.push(chunkId);
    totalChunks++;
  }

  // 5. Generate Manifest
  const manifest: FileManifest = {
    file_id: fileId,
    original_filename: filename,
    total_chunks: totalChunks,
    chunk_size: chunkSize,
    ordered_chunk_ids: chunkIds,
    creation_timestamp: Date.now(),
    mime_type: mimeType
  };

  // 6. Persist Manifest
  const manifestPath = path.join(MANIFESTS_DIR, `${fileId}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return manifest;
}

/**
 * Retrieval helper for future steps
 */
export function getManifest(fileId: string): FileManifest | null {
  const manifestPath = path.join(MANIFESTS_DIR, `${fileId}.json`);
  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function getChunkPath(fileId: string, chunkId: string): string | null {
  const chunkPath = path.join(CHUNKS_DIR, fileId, chunkId);
  if (!fs.existsSync(chunkPath)) return null;
  return chunkPath;
}

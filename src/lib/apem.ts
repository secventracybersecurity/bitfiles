export async function generateParity(shards: Blob[]): Promise<Blob> {
  const buffers = await Promise.all(shards.map(s => s.arrayBuffer()));
  const maxSize = Math.max(...buffers.map(b => b.byteLength));
  const parityBuffer = new Uint8Array(maxSize);

  for (let i = 0; i < maxSize; i++) {
    let xorValue = 0;
    for (const buffer of buffers) {
      if (i < buffer.byteLength) {
        xorValue ^= new Uint8Array(buffer)[i];
      }
    }
    parityBuffer[i] = xorValue;
  }

  return new Blob([parityBuffer]);
}

export async function recoverShard(shards: (Blob | null)[], parity: Blob, missingIndex: number): Promise<Blob> {
  const availableShards = shards.filter((s, i) => i !== missingIndex && s !== null) as Blob[];
  const buffers = await Promise.all([...availableShards, parity].map(s => s.arrayBuffer()));
  const maxSize = Math.max(...buffers.map(b => b.byteLength));
  const recoveredBuffer = new Uint8Array(maxSize);

  for (let i = 0; i < maxSize; i++) {
    let xorValue = 0;
    for (const buffer of buffers) {
      if (i < buffer.byteLength) {
        xorValue ^= new Uint8Array(buffer)[i];
      }
    }
    recoveredBuffer[i] = xorValue;
  }

  return new Blob([recoveredBuffer]);
}

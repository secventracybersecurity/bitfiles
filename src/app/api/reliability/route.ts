import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nodeId = searchParams.get('nodeId');

  if (!nodeId) {
    return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
  }

  // Mocking AI-based reliability scoring
  // In a real scenario, this would analyze historical uptime, shard health, and node behavior
  const baseReliability = 0.95;
  const jitter = (Math.random() - 0.5) * 0.1;
  const score = Math.min(1.0, Math.max(0.0, baseReliability + jitter));

  return NextResponse.json({
    nodeId,
    reliabilityScore: score,
    lastAnalysis: new Date().toISOString(),
    status: 'healthy'
  });
}

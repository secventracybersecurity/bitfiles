import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: metrics, error: mError } = await supabase
      .from('node_metrics')
      .select('status, health_score');

    if (mError) throw mError;

    const totalNodes = metrics.length;
    const activeNodes = metrics.filter(m => m.status === 'online' || m.status === 'active').length;
    const avgHealth = metrics.reduce((acc, m) => acc + (m.health_score || 0), 0) / (totalNodes || 1);

    const stats = {
      total_nodes: totalNodes,
      active_nodes: activeNodes,
      network_health_score: avgHealth,
      alerts: avgHealth < 0.8 ? ["Network reliability dropping"] : []
    };

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

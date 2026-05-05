import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin/gsc")({
  component: GscDashboard,
});

type MetricRow = {
  date: string;
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SyncRun = {
  id: string;
  started_at: string;
  finished_at: string | null;
  rows_written: number;
  status: string;
  error: string | null;
};

function formatPct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function formatInt(n: number) {
  return n.toLocaleString();
}

function GscDashboard() {
  useSeo({
    title: "Admin",
    description: "Private admin area.",
    path: "/admin/gsc",
    noindex: true,
  });
  const [rows, setRows] = useState<MetricRow[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [days, setDays] = useState(28);

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const [{ data: metrics }, { data: runData }] = await Promise.all([
      supabase
        .from("gsc_daily_metrics")
        .select("date,page,query,clicks,impressions,ctr,position")
        .gte("date", sinceStr)
        .order("date", { ascending: false })
        .limit(50000),
      supabase
        .from("gsc_sync_runs")
        .select("id,started_at,finished_at,rows_written,status,error")
        .order("started_at", { ascending: false })
        .limit(10),
    ]);
    setRows((metrics as MetricRow[]) ?? []);
    setRuns((runData as SyncRun[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [days]);

  async function triggerSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsc-sync?days=${days}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setSyncMsg(`Sync failed: ${body.error ?? res.statusText}`);
      } else {
        setSyncMsg(`Synced ${body.rowsWritten} rows (${body.startDate} to ${body.endDate}).`);
        await load();
      }
    } catch (e) {
      setSyncMsg(`Sync error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setSyncing(false);
  }

  const pageAgg = useMemo(() => {
    const map = new Map<string, { clicks: number; impressions: number; positionSum: number; n: number }>();
    for (const r of rows) {
      if (r.query !== "") continue;
      const cur = map.get(r.page) ?? { clicks: 0, impressions: 0, positionSum: 0, n: 0 };
      cur.clicks += r.clicks;
      cur.impressions += r.impressions;
      cur.positionSum += r.position * r.impressions;
      cur.n += r.impressions;
      map.set(r.page, cur);
    }
    return [...map.entries()]
      .map(([page, v]) => ({
        page,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions ? v.clicks / v.impressions : 0,
        position: v.n ? v.positionSum / v.n : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions);
  }, [rows]);

  const queryAgg = useMemo(() => {
    const map = new Map<string, { clicks: number; impressions: number; positionSum: number; n: number }>();
    for (const r of rows) {
      if (r.query === "") continue;
      const cur = map.get(r.query) ?? { clicks: 0, impressions: 0, positionSum: 0, n: 0 };
      cur.clicks += r.clicks;
      cur.impressions += r.impressions;
      cur.positionSum += r.position * r.impressions;
      cur.n += r.impressions;
      map.set(r.query, cur);
    }
    return [...map.entries()]
      .map(([query, v]) => ({
        query,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions ? v.clicks / v.impressions : 0,
        position: v.n ? v.positionSum / v.n : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 100);
  }, [rows]);

  const lowCtrOpportunities = useMemo(() => {
    return pageAgg
      .filter((p) => p.impressions >= 200 && p.ctr < 0.02 && p.position < 20)
      .slice(0, 20);
  }, [pageAgg]);

  const totals = useMemo(() => {
    return pageAgg.reduce(
      (acc, p) => {
        acc.clicks += p.clicks;
        acc.impressions += p.impressions;
        return acc;
      },
      { clicks: 0, impressions: 0 },
    );
  }, [pageAgg]);

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-xl font-bold text-black">GSC Dashboard</h1>
        <p className="text-sm text-black/70 mt-2">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your env.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e4d45]">
            Admin
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black leading-tight">
            Search Console
          </h1>
          <p className="text-xs sm:text-sm text-black/60 mt-1">
            Clicks, impressions, CTR, and average position pulled via the Google Search Console API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="text-xs border border-[#e4d9cf] bg-white rounded px-2 py-1.5"
          >
            <option value={7}>Last 7 days</option>
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="text-xs font-semibold bg-[#0e4d45] hover:bg-[#0a3832] text-[#fef6f1] px-3 py-1.5 rounded-sm uppercase tracking-wide disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync from GSC"}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="mb-3 text-xs bg-white border border-[#e4d9cf] rounded px-3 py-2 text-black">
          {syncMsg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <StatCard label="Clicks" value={formatInt(totals.clicks)} />
        <StatCard label="Impressions" value={formatInt(totals.impressions)} />
        <StatCard
          label="Avg CTR"
          value={totals.impressions ? formatPct(totals.clicks / totals.impressions) : "—"}
        />
        <StatCard label="Tracked pages" value={formatInt(pageAgg.length)} />
      </div>

      {loading ? (
        <div className="text-sm text-black/60">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-[#e4d9cf] rounded p-4 text-sm text-black/70">
          No data yet. Click <strong>Sync from GSC</strong> to pull the first batch.
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            title="Top pages"
            columns={["Page", "Clicks", "Impressions", "CTR", "Position"]}
            rows={pageAgg.slice(0, 50).map((p) => [
              p.page.replace(/^https?:\/\/[^/]+/, ""),
              formatInt(p.clicks),
              formatInt(p.impressions),
              formatPct(p.ctr),
              p.position.toFixed(1),
            ])}
          />

          <DataTable
            title="Top queries"
            columns={["Query", "Clicks", "Impressions", "CTR", "Position"]}
            rows={queryAgg.slice(0, 50).map((q) => [
              q.query,
              formatInt(q.clicks),
              formatInt(q.impressions),
              formatPct(q.ctr),
              q.position.toFixed(1),
            ])}
          />

          {lowCtrOpportunities.length > 0 && (
            <DataTable
              title="Low-CTR opportunities (≥200 impressions, CTR <2%, position <20)"
              columns={["Page", "Impressions", "CTR", "Position"]}
              rows={lowCtrOpportunities.map((p) => [
                p.page.replace(/^https?:\/\/[^/]+/, ""),
                formatInt(p.impressions),
                formatPct(p.ctr),
                p.position.toFixed(1),
              ])}
            />
          )}

          {runs.length > 0 && (
            <DataTable
              title="Recent sync runs"
              columns={["Started", "Status", "Rows", "Error"]}
              rows={runs.map((r) => [
                new Date(r.started_at).toLocaleString(),
                r.status,
                formatInt(r.rows_written),
                r.error ?? "—",
              ])}
            />
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#e4d9cf] rounded p-3">
      <div className="text-[10px] text-black/50 uppercase tracking-wider">{label}</div>
      <div className="text-lg sm:text-xl font-bold text-black">{value}</div>
    </div>
  );
}

function DataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="bg-white border border-[#e4d9cf] rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-[#e4d9cf] bg-[#fef6f1]">
        <h2 className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] sm:text-xs">
          <thead>
            <tr className="bg-[#f5ede2] border-b border-[#e4d9cf]">
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={`px-3 py-2 font-bold text-[#0e4d45] uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-[#e4d9cf] last:border-b-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 text-black ${ci === 0 ? "text-left truncate max-w-[380px]" : "text-right whitespace-nowrap tabular-nums"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

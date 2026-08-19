import { useEffect, useState, useCallback } from 'react';

const PROXY_URL = 'http://localhost:8080';
const POLL_INTERVAL_MS = 5000;

function VerdictBadge({ verdict }) {
  const color = verdict === 'allow'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${color} uppercase`}>
      {verdict}
    </span>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 shadow-sm ${accent}`}>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch(`${PROXY_URL}/dashboard/live`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const requests = data?.requests ?? [];
  const summary = data?.summary ?? { total: 0, allowed: 0, blocked: 0 };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edhir Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time request monitoring</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">
            Auto-refreshes every 5s
            {lastUpdated && <> · Last updated <strong>{lastUpdated}</strong></>}
          </span>
          {error && (
            <p className="text-xs text-red-500 mt-0.5">⚠ {error}</p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Summary cards */}
        <section className="grid grid-cols-3 gap-4">
          <SummaryCard label="Total Requests (last 50)" value={summary.total} accent="border-gray-200" />
          <SummaryCard label="Allowed" value={summary.allowed} accent="border-green-200 bg-green-50" />
          <SummaryCard label="Blocked" value={summary.blocked} accent="border-red-200 bg-red-50" />
        </section>

        {/* Request table */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Recent Requests</h2>
            <span className="text-xs text-gray-400">{requests.length} rows</span>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              {error ? 'Could not reach proxy-service.' : 'Waiting for traffic…'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Timestamp</th>
                    <th className="px-6 py-3 text-left">Method</th>
                    <th className="px-6 py-3 text-left">Path</th>
                    <th className="px-6 py-3 text-left">Verdict</th>
                    <th className="px-6 py-3 text-right">Latency (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r, i) => (
                    <tr key={r.id ?? i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 font-mono whitespace-nowrap">
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-6 py-3 font-mono font-semibold text-gray-700">
                        {r.method}
                      </td>
                      <td className="px-6 py-3 text-gray-700 font-mono break-all max-w-xs">
                        {r.path}
                      </td>
                      <td className="px-6 py-3">
                        <VerdictBadge verdict={r.verdict} />
                      </td>
                      <td className="px-6 py-3 text-right text-gray-500">
                        {r.responseTimeMs ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

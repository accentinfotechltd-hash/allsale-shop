"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, ClipboardList } from "lucide-react";

export default function AdminActivityLog() {
  const [log, setLog] = useState<any[] | null>(null);

  useEffect(() => {
    api.adminActivityLog().then(setLog).catch(() => setLog([]));
  }, []);

  if (log === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="admin-activity-log-page">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="w-6 h-6 text-slate-700" />
        <h1 className="heading-lg">Activity log</h1>
      </div>
      <p className="text-slate-600 mb-6">{log.length} entries. Newest first.</p>

      {log.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">No activity yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {log.map((e: any, i: number) => (
                <tr key={e.id || i} data-testid={`activity-row-${i}`}>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {e.created_at ? new Date(e.created_at).toLocaleString("en-NZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{e.actor_email || e.actor || "system"}</div>
                    {e.actor_role && <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{e.actor_role}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{e.action || e.event}</td>
                  <td className="px-4 py-3 text-slate-700 text-xs">{e.target || e.target_id || e.details?.target || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

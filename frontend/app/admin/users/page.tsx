"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.adminUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  if (users === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const filtered = q
    ? users.filter((u) => (u.email + " " + (u.full_name || "")).toLowerCase().includes(q.toLowerCase()))
    : users;

  return (
    <div data-testid="admin-users-page">
      <h1 className="heading-lg mb-2">Users</h1>
      <p className="text-slate-600 mb-6">{users.length} registered users</p>

      <div className="relative mb-5 max-w-sm">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 text-sm font-medium"
          data-testid="users-search"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Seller</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u: any) => (
              <tr key={u.id || u._id || u.user_id} data-testid={`admin-user-row-${u.id || u.user_id}`}>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{u.full_name || "—"}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{u.country || "—"}</td>
                <td className="px-4 py-3">
                  {u.is_seller ? (
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-wider">Seller</span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en-NZ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

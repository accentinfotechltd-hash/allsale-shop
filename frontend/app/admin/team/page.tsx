"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { useAdmin } from "@/components/admin/auth";
import { Loader2, UserCog, KeyRound, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminTeam() {
  const { admin } = useAdmin();
  const [team, setTeam] = useState<any[] | null>(null);
  const [roles, setRoles] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const [t, r] = await Promise.all([
      api.adminTeam().catch(() => []),
      api.adminTeamRoles().catch(() => null),
    ]);
    setTeam(t);
    setRoles(r);
  };

  useEffect(() => { load(); }, []);

  if (team === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  if (admin?.role !== "owner") {
    return <div className="py-20 text-center text-slate-500">Only the owner can manage the team.</div>;
  }

  return (
    <div data-testid="admin-team-page">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="heading-lg flex items-center gap-3"><UserCog className="w-7 h-7 text-violet-700" /> Team & roles</h1>
          <p className="text-slate-600 mt-1 text-sm">{team.length} admin{team.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" data-testid="invite-admin-btn">
          <Plus className="w-4 h-4" /> Invite admin
        </button>
      </div>

      {/* Roles legend */}
      {roles && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mt-6 mb-6 text-sm text-violet-900">
          <div className="font-bold mb-2">Role permissions</div>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            {Object.entries(roles).map(([role, info]: [string, any]) => (
              <div key={role}>
                <div className="font-bold uppercase tracking-wider mb-1">{role}</div>
                <div className="text-violet-800/80">{info.description || (Array.isArray(info.permissions) ? info.permissions.join(", ") : "")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
            <tr>
              <th className="px-4 py-3 text-left">Admin</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {team.map((a: any) => (
              <TeamRow key={a.id} a={a} onChanged={load} currentAdminId={admin?.id} />
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

function TeamRow({ a, onChanged, currentAdminId }: any) {
  const [busy, setBusy] = useState<string | null>(null);

  const resetPwd = async () => {
    setBusy("reset");
    try {
      const r = await api.adminResetPassword(a.id);
      if (r?.new_password || r?._initial_password) {
        const p = r.new_password || r._initial_password;
        // copy
        if (typeof navigator !== "undefined") navigator.clipboard?.writeText(p);
        toast.success(`Password reset · ${p} (copied to clipboard)`, { duration: 12000 });
      } else {
        toast.success("Password reset");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally { setBusy(null); }
  };

  const remove = async () => {
    if (!confirm(`Remove ${a.email} from the team?`)) return;
    setBusy("delete");
    try {
      await api.adminDeleteAdmin(a.id);
      toast.success("Removed");
      await onChanged();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally { setBusy(null); }
  };

  const isSelf = a.id === currentAdminId;

  return (
    <tr data-testid={`team-row-${a.id}`}>
      <td className="px-4 py-3">
        <div className="font-bold text-slate-900">{a.full_name || a.email}</div>
        <div className="text-xs text-slate-500">{a.email} {isSelf && <span className="ml-1 text-[10px] font-bold text-primary">(you)</span>}</div>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">{a.role}</span>
      </td>
      <td className="px-4 py-3">
        {a.is_active !== false ? (
          <span className="text-emerald-700 text-xs font-bold">Active</span>
        ) : (
          <span className="text-slate-400 text-xs">Disabled</span>
        )}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button onClick={resetPwd} disabled={busy === "reset"} className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 mr-3" data-testid={`reset-pwd-${a.id}`}>
          {busy === "reset" ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} Reset
        </button>
        {!isSelf && (
          <button onClick={remove} disabled={busy === "delete"} className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900" data-testid={`delete-admin-${a.id}`}>
            {busy === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Remove
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("support");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.adminCreateAdmin({ email, full_name: fullName, role });
      const pwd = r?._initial_password || r?.initial_password;
      if (pwd) {
        if (typeof navigator !== "undefined") navigator.clipboard?.writeText(pwd);
        toast.success(`Admin created. Initial password: ${pwd} (copied)`, { duration: 15000 });
      } else {
        toast.success("Admin created");
      }
      await onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Could not create admin");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl p-7">
        <h2 className="heading-sm mb-4">Invite a new admin</h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-600 block mb-1.5">Full name</span>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" data-testid="ca-name" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-600 block mb-1.5">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" data-testid="ca-email" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-600 block mb-1.5">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" data-testid="ca-role">
              <option value="support">Support (read-only KYC + orders)</option>
              <option value="manager">Manager (full ops, no team mgmt)</option>
              <option value="owner">Owner (full access)</option>
            </select>
          </label>
          <p className="text-[11px] text-slate-500">A one-time password will be generated and shown once. Copy and share securely.</p>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1" data-testid="ca-submit">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create admin"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

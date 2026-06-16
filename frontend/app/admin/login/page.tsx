"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAdmin } from "@/components/admin/auth";
import { Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, token, loading: bootLoading } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bootLoading && token) router.replace("/admin");
  }, [bootLoading, token, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.adminLogin(email, password);
      setAuth(res.access_token, res.admin);
      toast.success("Signed in");
      router.push("/admin");
    } catch (e: any) {
      toast.error(e?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-px py-16 md:py-24" data-testid="admin-login-page">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-full bg-slate-900 text-white items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="heading-lg">Admin</h1>
          <p className="text-slate-600 mt-2">Allsale operations console</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 p-7 md:p-9 shadow-sm space-y-4">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@allsale.co.nz"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none text-sm font-medium"
                data-testid="admin-email-input"
              />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-full border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none text-sm font-medium"
                data-testid="admin-password-input"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 py-3 font-bold transition disabled:opacity-50" data-testid="admin-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">← Back to store</Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Globe, Loader2, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { GOOGLE_AUTH_URL } from "@/lib/utils";
import { toast } from "sonner";

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { setAuth, country: defaultCountry, token, bootstrapped } = useApp();

  useEffect(() => {
    if (bootstrapped && token) router.replace(next);
  }, [bootstrapped, token, router, next]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState(defaultCountry || "NZ");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultCountry) setCountry(defaultCountry);
  }, [defaultCountry]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({ email, password, full_name: fullName, country });
      if (res.access_token) {
        setAuth(res.access_token);
        toast.success("Welcome to Allsale!");
        router.push(next);
      } else {
        // some backends require explicit login after register
        const loginRes = await api.login({ email, password });
        if (loginRes.access_token) {
          setAuth(loginRes.access_token);
          router.push(next);
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/google-callback";
    window.location.href = `${GOOGLE_AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="container-px py-12 md:py-20" data-testid="register-page">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-black text-xl">
              अ
            </span>
          </Link>
          <h1 className="heading-lg mt-5">Create your account</h1>
          <p className="text-slate-600 mt-2">Join 12,000+ shoppers buying India worldwide</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-9 shadow-sm">
          <button
            onClick={googleSignIn}
            className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-full px-6 py-3 font-bold transition mb-5"
            data-testid="google-signup-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"/></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-500 font-medium">or with email</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Full name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                  data-testid="register-name-input"
                />
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                  data-testid="register-email-input"
                />
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-11 pr-11 py-3 rounded-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                  data-testid="register-password-input"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-2">Shipping country</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium bg-white appearance-none"
                  data-testid="register-country-select"
                >
                  <option value="NZ">🇳🇿 New Zealand</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="CA">🇨🇦 Canada</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base" data-testid="register-submit-button">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              By creating an account you agree to our terms & privacy policy.
            </p>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline" data-testid="login-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-px py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <RegisterInner />
    </Suspense>
  );
}

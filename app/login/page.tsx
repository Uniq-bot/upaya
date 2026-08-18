"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UpayaLogo } from "@/components/UpayaLogo";
import { loginBusiness, getBusinessMe } from "@/lib/api/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    async function checkAuth() {
      const res = await getBusinessMe();
      if (res.data?.user) {
        router.replace("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await loginBusiness(email.trim(), password);

    if (res.error || !res.data) {
      setErrorMessage(res.error || "Invalid email or password");
      setLoading(false);
    } else {
      router.replace("/dashboard");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#84CC16] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center mb-2">
            <UpayaLogo size="md" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Portal</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Sign in with your staff or owner credentials to manage your loyalty program.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="owner@business.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              loadingText="Signing in..."
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Encrypted Cookie Session Authentication</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 font-mono">
          UPAYA DIGITAL LOYALTY PLATFORM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

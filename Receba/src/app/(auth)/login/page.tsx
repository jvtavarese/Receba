"use client";

import { useState } from "react";
import { login } from "./actions";
import { Mail, Eye, EyeOff, ArrowRight, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 animate-gradient items-center justify-center p-12">
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 max-w-md space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Receba"
              width={48}
              height={48}
              className="rounded-2xl"
            />
            <span className="text-2xl font-bold text-white tracking-tight">Receba</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Controle total das suas
            <span className="text-emerald-300"> comissões</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Acompanhe vendas, duplicatas e recebíveis de todas as suas empresas representadas em um só lugar.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span>Metas e progresso em tempo real</span>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Receba"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-xl font-bold tracking-tight">Receba</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="flex h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent hover:border-muted-foreground/30"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2 pr-11 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent hover:border-muted-foreground/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

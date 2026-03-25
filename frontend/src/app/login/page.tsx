"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      // Redirect to the page that sent the user here (e.g. /checkout), or home
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Verifica tu email y contraseña.')
    }
  }

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center pt-32 pb-20 px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center">Login</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-10 text-center">
          Enter your details below to access your account.
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-border/50 bg-transparent py-4 text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-border/50 bg-transparent py-4 text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-3 h-3 rounded-none border-border accent-black" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Remember Me</span>
            </label>
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors mt-6 flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
            ) : (
              <>Sign In <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <div className="mt-12 text-center w-full border-t border-border/50 pt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Don't have an account?
          </p>
          <Link
            href="/register"
            className="block w-full border border-border py-4 text-[11px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-muted transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}

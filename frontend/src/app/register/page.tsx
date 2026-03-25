"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
        await register({ email, password, first_name: firstName, last_name: lastName })
        router.push('/')
    } catch (err: any) {
        setError(err.message || 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:block relative bg-zinc-900 border-r border-border">
            <div className="absolute inset-0 bg-black/50 z-10" />
            <img 
                src="https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1920&auto=format&fit=crop" 
                alt="Register Visual" 
                className="w-full h-full object-cover grayscale opacity-70"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-12">
                <Link href="/" className="text-2xl font-black uppercase tracking-tighter text-white">Shepherd Garde</Link>
                <div className="text-white">
                    <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4 max-w-md">Join the Vanguard.</h2>
                    <p className="text-zinc-300 font-light">Create an account to track orders and secure exclusive access to future drops.</p>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-center p-8 bg-background">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Register</h1>
                    <p className="text-muted-foreground">Create your account.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 text-sm font-bold overflow-hidden break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">First Name</label>
                            <input 
                                type="text" 
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-secondary border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Last Name</label>
                            <input 
                                type="text" 
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-secondary border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-white text-black py-4 mt-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex justify-center items-center"
                    >
                        {isLoading ? (
                             <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
                </div>
            </motion.div>
        </div>
    </div>
  )
}

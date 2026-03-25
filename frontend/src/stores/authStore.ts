import { create } from 'zustand'
import { fetchAPI } from '@/lib/api'

interface AuthUser {
    id: string
    email: string
    first_name: string
    last_name: string
}

interface AuthState {
    user: AuthUser | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean

    login: (email: string, password: string) => Promise<void>
    register: (data: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>
    logout: () => void
    loadUser: () => Promise<void>
}

/**
 * Sets or removes the `sg_authenticated` cookie used by Next.js middleware
 * to protect /checkout and /account routes server-side.
 * Note: This is a presence-indicator cookie (not the actual token).
 * The real JWT enforcement is done by Django on the API.
 */
function setAuthCookie(authenticated: boolean) {
    if (typeof document === 'undefined') return
    if (authenticated) {
        // Session-level cookie (expires when browser closes)
        document.cookie = 'sg_authenticated=1; path=/; SameSite=Lax'
    } else {
        // Expire the cookie immediately
        document.cookie = 'sg_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
    isLoading: false,

    login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
            const data = await fetchAPI('/auth/login/', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            setAuthCookie(true)
            set({ accessToken: data.access, isAuthenticated: true, isLoading: false })
            
            const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sg_cart_session') : null
            if (sessionId) {
                try {
                    await fetchAPI('/shop/cart/merge/', {
                        method: 'POST',
                        body: JSON.stringify({ session_id: sessionId })
                    })
                    localStorage.removeItem('sg_cart_session')
                } catch (e) {
                    console.error('Cart merge failed', e)
                }
            }

            await get().loadUser()
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    register: async (data) => {
        set({ isLoading: true })
        try {
            const response = await fetchAPI('/auth/register/', {
                method: 'POST',
                body: JSON.stringify(data)
            })
            localStorage.setItem('access_token', response.access)
            localStorage.setItem('refresh_token', response.refresh)
            setAuthCookie(true)
            set({
                user: response.user,
                accessToken: response.access,
                isAuthenticated: true,
                isLoading: false
            })
            
            const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sg_cart_session') : null
            if (sessionId) {
                try {
                    await fetchAPI('/shop/cart/merge/', {
                        method: 'POST',
                        body: JSON.stringify({ session_id: sessionId })
                    })
                    localStorage.removeItem('sg_cart_session')
                } catch (e) {
                    console.error('Cart merge failed', e)
                }
            }
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setAuthCookie(false)
        set({ user: null, accessToken: null, isAuthenticated: false })
    },

    loadUser: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        if (!token) return
        try {
            const user = await fetchAPI('/auth/profile/')
            setAuthCookie(true)
            set({ user, isAuthenticated: true })
        } catch {
            // Token inválido o expirado — limpiar sesión
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setAuthCookie(false)
            set({ user: null, accessToken: null, isAuthenticated: false })
        }
    }
}))

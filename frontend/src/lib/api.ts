const ENV_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_BASE_URL = ENV_URL.endsWith('/api/v1') ? ENV_URL : `${ENV_URL}/api/v1`

/**
 * Central API client for Shepherd Garde.
 * 
 * Security features:
 * - Automatically attaches JWT Bearer token from localStorage
 * - Detects 401 responses and attempts token refresh transparently
 * - If refresh fails (expired/invalid), clears session and redirects to /login
 * - Retry logic: original request retried once with new token after refresh
 */

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback)
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
    if (!refreshToken) throw new Error('no_refresh_token')

    const response = await fetch(`${API_BASE_URL}/auth/login/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
        throw new Error('refresh_failed')
    }

    const data = await response.json()
    localStorage.setItem('access_token', data.access)
    // If server rotates the refresh token (ROTATE_REFRESH_TOKENS=True), update it
    if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh)
    }
    return data.access
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // Attach anonymous cart session ID if available
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sg_cart_session') : null
    if (sessionId) {
        headers['X-Session-ID'] = sessionId
    }

    const makeRequest = (authToken?: string) => {
        const url = `${API_BASE_URL}${endpoint}`
        console.log("FETCHING EXACT URL:", url)
        return fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
        })
    }

    let response = await makeRequest()

    // ── Token Refresh Logic ───────────────────────────────────────────
    // If access token is expired (401), silently refresh and retry once
    if (response.status === 401 && typeof window !== 'undefined') {
        if (!isRefreshing) {
            isRefreshing = true
            try {
                const newToken = await refreshAccessToken()
                isRefreshing = false
                onRefreshed(newToken)
                // Retry the original request with the new token
                response = await makeRequest(newToken)
            } catch {
                isRefreshing = false
                // Refresh failed: clear session and redirect to login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                throw new Error('Session expired. Please log in again.')
            }
        } else {
            // Another request already refreshing — wait for it to finish
            const newToken = await new Promise<string>((resolve) => {
                subscribeTokenRefresh(resolve)
            })
            response = await makeRequest(newToken)
        }
    }
    // ─────────────────────────────────────────────────────────────────

    if (response.status === 204) return null

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        // Extract first human-readable error message from DRF response
        const errorMessage = extractErrorMessage(data) || `API Error: ${response.status} on ${response.url}`
        const err = new Error(errorMessage)
        ;(err as any).status = response.status
        ;(err as any).data = data
        ;(err as any).url = response.url
        throw err
    }

    return data
}

/**
 * Extracts the first human-readable error message from a DRF error response.
 * DRF can return errors as strings, arrays, or nested objects.
 */
function extractErrorMessage(data: any): string | null {
    if (!data || typeof data !== 'object') return null
    for (const key of Object.keys(data)) {
        const val = data[key]
        if (typeof val === 'string') return val
        if (Array.isArray(val) && typeof val[0] === 'string') return val[0]
    }
    return null
}

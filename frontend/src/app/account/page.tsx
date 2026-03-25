"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PackageOpen, ArrowRight, ShoppingBag } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

interface OrderItem {
    id: string
    product_name: string
    size: string
    color: string
    quantity: number
    price_at_purchase: string
    subtotal: string
}

interface Order {
    id: string
    status: string
    total_amount: string
    created_at: string
    shipping_address: {
        alias: string
        address_line: string
        city: string
        country: string
    } | null
    items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
    shipped: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function AccountPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            await loadUser()
            const state = useAuthStore.getState()
            if (!state.isAuthenticated) {
                router.push('/login')
                return
            }
            try {
                const data = await fetchAPI('/shop/orders/')
                setOrders(data.results || data)
            } catch (err) {
                console.error('Error fetching orders:', err)
            } finally {
                setIsLoadingOrders(false)
            }
        }
        init()
    }, [])

    return (
        <div className="min-h-screen bg-background pt-10 pb-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                {/* Header */}
                <div className="mb-12 pb-8 border-b border-border">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">My Account</h1>
                    {user && (
                        <p className="text-muted-foreground text-sm">
                            {user.first_name} {user.last_name} · {user.email}
                        </p>
                    )}
                </div>

                {/* Order History */}
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter mb-6">Order History</h2>

                    {isLoadingOrders ? (
                        <div className="flex justify-center py-12">
                            <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="border border-border bg-secondary p-16 text-center">
                            <PackageOpen size={48} className="mx-auto mb-4 text-muted-foreground" strokeWidth={1} />
                            <p className="text-muted-foreground mb-6 font-medium">You haven't placed any orders yet.</p>
                            <Link href="/catalog" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                                Start Shopping <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-border bg-secondary">
                                    {/* Order Header */}
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-6">
                                            <ShoppingBag size={20} strokeWidth={1.5} className="text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <p className="font-bold text-sm font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${STATUS_COLORS[order.status] || 'bg-secondary'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-lg">${parseFloat(order.total_amount).toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                        </div>
                                    </button>

                                    {/* Expandable Items */}
                                    {expandedOrder === order.id && (
                                        <div className="border-t border-border divide-y divide-border">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-sm">{item.product_name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.color} / {item.size} · Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-bold">${parseFloat(item.subtotal).toFixed(2)}</p>
                                                </div>
                                            ))}
                                            {order.shipping_address && (
                                                <div className="px-6 py-4 text-xs text-muted-foreground">
                                                    <span className="font-bold uppercase tracking-wider">Shipped to: </span>
                                                    {order.shipping_address.address_line}, {order.shipping_address.city}, {order.shipping_address.country}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

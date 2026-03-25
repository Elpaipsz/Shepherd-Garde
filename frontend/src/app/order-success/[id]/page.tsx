"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import { fetchAPI } from '@/lib/api'

interface OrderItem {
    id: string
    product_name: string
    size: string
    color: string
    quantity: number
    subtotal: string
}

interface Order {
    id: string
    status: string
    total_amount: string
    created_at: string
    shipping_address: { alias: string; address_line: string; city: string; country: string } | null
    items: OrderItem[]
}

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Get all orders and find matching one (since DRF returns list)
                const data = await fetchAPI('/shop/orders/')
                const orders: Order[] = Array.isArray(data) ? data : (data.results || [])
                const found = orders.find((o) => o.id === id || o.id.startsWith(id))
                setOrder(found || null)
            } catch {
                // Order not found - show generic success
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <div className="max-w-lg w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-20 h-20 mx-auto mb-8 bg-green-500/10 border border-green-500/20 flex items-center justify-center"
                    >
                        <CheckCircle2 size={40} className="text-green-400" strokeWidth={1.5} />
                    </motion.div>

                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">Order Confirmed</h1>
                    <p className="text-muted-foreground text-sm mb-2">
                        Thank you for your purchase. You'll receive a confirmation shortly.
                    </p>
                    {id && (
                        <p className="font-mono text-xs text-muted-foreground/60 mb-10">
                            Order #{id.slice(0, 8).toUpperCase()}
                        </p>
                    )}

                    {/* Order Summary */}
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : order ? (
                        <div className="border border-border bg-secondary mb-10 text-left">
                            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                                <Package size={16} strokeWidth={1.5} className="text-muted-foreground" />
                                <span className="text-xs font-bold uppercase tracking-wider">Order Summary</span>
                            </div>
                            <div className="divide-y divide-border">
                                {order.items.map((item) => (
                                    <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-sm">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground">{item.color} / {item.size} · Qty {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-sm">${parseFloat(item.subtotal).toFixed(2)}</p>
                                    </div>
                                ))}
                                <div className="px-6 py-4 flex justify-between items-center bg-muted/30">
                                    <span className="font-black text-sm uppercase tracking-wider">Total</span>
                                    <span className="font-black text-lg">${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                            {order.shipping_address && (
                                <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
                                    <span className="font-bold">Ships to: </span>
                                    {order.shipping_address.address_line}, {order.shipping_address.city}
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/account"
                            className="flex-1 py-4 border border-border text-[11px] font-bold uppercase tracking-wider text-center hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        >
                            View Orders
                        </Link>
                        <Link
                            href="/catalog"
                            className="flex-1 py-4 bg-white text-black text-[11px] font-black uppercase tracking-wider text-center hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Continue Shopping <ArrowRight size={14} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

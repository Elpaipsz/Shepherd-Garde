"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'

export default function CartPage() {
    const { items, total, isLoading, fetchCart, removeItem, updateQuantity } = useCartStore()

    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    if (isLoading && items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center"><span className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></span></div>
    }

    return (
        <div className="min-h-screen bg-background pt-10 pb-24">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-12">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 border border-border bg-secondary">
                        <p className="text-muted-foreground mb-6">Your cart is currently empty.</p>
                        <Link href="/catalog" className="inline-flex items-center justify-center bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-6">
                            {items.map((item) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    className="flex gap-6 border-b border-border pb-6"
                                >
                                    <div className="w-24 h-32 md:w-32 md:h-40 shrink-0 bg-secondary relative overflow-hidden">
                                        {item.product?.main_image ? (
                                            <img src={item.product.main_image} alt={item.product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src="https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=400&auto=format&fit=crop" alt="Item" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{item.product?.name}</h3>
                                                <span className="font-bold whitespace-nowrap ml-4">${parseFloat(item.subtotal).toFixed(2)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {item.variant?.color} / {item.variant?.size}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="inline-flex items-center border border-border">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-secondary transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-secondary transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-wider"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:w-96 shrink-0">
                            <div className="bg-secondary p-8 border border-border sticky top-24">
                                <h2 className="text-xl font-bold uppercase tracking-tighter mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-bold">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 mb-8 flex justify-between items-center">
                                    <span className="font-bold uppercase tracking-wider">Total</span>
                                    <span className="text-2xl font-black">${total.toFixed(2)}</span>
                                </div>

                                <Link href="/checkout" className="w-full bg-white text-black py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                                    Proceed to Checkout <ArrowRight size={18} />
                                </Link>

                                <div className="mt-6">
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        By proceeding to checkout, you agree to our Terms of Service and Privacy Policy. Hype Drops are final sale.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

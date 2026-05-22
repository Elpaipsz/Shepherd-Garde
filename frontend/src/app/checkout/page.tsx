"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

import { ReservationAlert } from '@/components/checkout/ReservationAlert'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { ContactSection } from '@/components/checkout/ContactSection'
import { DeliverySection } from '@/components/checkout/DeliverySection'
import { PaymentSection } from '@/components/checkout/PaymentSection'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function CheckoutPage() {
    const { items, total, isLoading: isCartLoading, fetchCart } = useCartStore()
    const { isAuthenticated, user } = useAuthStore()
    const router = useRouter()
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])
    
    const [formData, setFormData] = useState({
        email: '',
        country: 'US',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zip: '',
        cardNumber: '',
        exp: '',
        cvc: '',
        cardName: ''
    })

    useEffect(() => {
        fetchCart()
        if (user?.email) {
            setFormData(prev => ({ 
                ...prev, 
                email: user.email, 
                firstName: user.first_name || '', 
                lastName: user.last_name || '' 
            }))
        }
    }, [fetchCart, user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (items.length === 0) {
            setError("Your cart is empty.")
            return
        }

        if (!isAuthenticated) {
            setError("You must be logged in to checkout.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const addressPayload = {
                alias: 'Checkout Address',
                address_line: formData.address + (formData.apartment ? ` Apt ${formData.apartment}` : ''),
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postal_code: formData.zip,
            }
            
            const addressRes = await fetchAPI('/shop/addresses/', {
                method: 'POST',
                body: JSON.stringify(addressPayload),
            })

            const orderRes = await fetchAPI('/shop/checkout/', {
                method: 'POST',
                body: JSON.stringify({ shipping_address_id: addressRes.id }),
            })

            setTimeout(() => fetchCart(), 500)
            router.push(`/order-success/${orderRes.order_id || 'demo'}`)

        } catch (err: any) {
            console.error('Checkout error:', err)
            setError(err.message || 'An error occurred during checkout. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2D2B2A] font-[family-name:var(--font-inter)] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-black selection:text-white pt-24">
            
            <header className="w-full max-w-[600px] flex items-center justify-between mb-12">
                <Link aria-label="Go back" href="/catalog" className="text-[#1A1918] hover:text-[#C2BDB5] transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-[#1A1918] font-[family-name:var(--font-playfair)]">Shepherd Garde</h1>
                <div className="w-10"></div> 
            </header>

            <main className="w-full max-w-[600px] flex flex-col gap-8 pb-24">
                
                {/* Breadcrumbs */}
                <div className="mb-[-1rem]">
                    <Breadcrumbs items={[
                        { label: 'Home', href: '/' },
                        { label: 'Cart', href: '/cart' },
                        { label: 'Checkout' }
                    ]} />
                </div>

                {/* Reservation Alert */}
                <ReservationAlert />

                {/* Order Summary Accordion */}
                <OrderSummary items={items} total={total} />

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    
                    {/* Sections */}
                    <ContactSection formData={formData} handleInputChange={handleInputChange} mounted={mounted} isAuthenticated={isAuthenticated} />
                    <DeliverySection formData={formData} handleInputChange={handleInputChange} />
                    <PaymentSection formData={formData} handleInputChange={handleInputChange} />

                    {/* Actions */}
                    <div className="mt-6">
                        <button 
                            type="submit"
                            disabled={isSubmitting || items.length === 0}
                            className={`w-full h-[56px] bg-[#1A1918] text-white rounded-full font-medium text-[15px] flex items-center justify-center transition-all relative group
                            ${(isSubmitting || items.length === 0) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black hover:shadow-float'}`}
                        >
                            <span className={`${isSubmitting ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                                Pay ${total.toFixed(2)}
                            </span>
                            
                            {isSubmitting && (
                                <span className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <footer className="mt-12 pt-8 border-t border-[#E6E4DF]/50 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] text-[#C2BDB5] uppercase tracking-widest font-semibold">
                    <Link href="#" className="hover:text-[#2D2B2A] transition-colors">Refund policy</Link>
                    <Link href="#" className="hover:text-[#2D2B2A] transition-colors">Privacy policy</Link>
                    <Link href="#" className="hover:text-[#2D2B2A] transition-colors">Terms of service</Link>
                </footer>
            </main>
        </div>
    )
}

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const FloatingInput = ({ 
    id, label, type = "text", value, onChange, required = false, placeholder = "", options = [] 
}: { 
    id: string, label: string, type?: string, value: string, onChange: (e: any) => void, required?: boolean, placeholder?: string, options?: {value: string, label: string}[] 
}) => {
    const isFloating = value.length > 0;
    
    if (type === 'select') {
        return (
            <div className="relative mb-4">
                <select 
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full h-[56px] pt-[24px] px-[16px] pb-[8px] bg-[#FDFBF7] border border-[#E6E4DF] rounded-xl text-[15px] text-[#2D2B2A] outline-none transition-all focus:border-[#1A1918] focus:ring-1 focus:ring-[#1A1918] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%232D2B2A%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
                >
                    <option value="" disabled hidden></option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <label 
                    htmlFor={id}
                    className={`absolute left-[16px] pointer-events-none transition-all origin-top-left ${isFloating ? 'top-[8px] text-[12px] text-[#1A1918]' : 'top-[18px] text-[15px] text-[#C2BDB5]'}`}
                >
                    {label}
                </label>
            </div>
        )
    }

    return (
        <div className="relative mb-4">
            <input 
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="peer w-full h-[56px] pt-[24px] px-[16px] pb-[8px] bg-[#FDFBF7] border border-[#E6E4DF] rounded-xl text-[15px] text-[#2D2B2A] outline-none transition-all focus:border-[#1A1918] focus:ring-1 focus:ring-[#1A1918]"
            />
            <label 
                htmlFor={id}
                className={`absolute left-[16px] pointer-events-none transition-all origin-top-left ${isFloating ? 'top-[8px] text-[12px] text-[#1A1918]' : 'top-[18px] text-[15px] text-[#C2BDB5] peer-focus:top-[8px] peer-focus:text-[12px] peer-focus:text-[#1A1918]'}`}
            >
                {label}
            </label>
            {id === 'cardNumber' && (
                <div className="absolute right-4 top-4 text-[#C2BDB5]">
                    <span className="material-symbols-outlined">credit_card</span>
                </div>
            )}
            {id === 'cvc' && (
                <div className="absolute right-4 top-4 text-[#C2BDB5] cursor-help" title="3 digits on back of card">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                </div>
            )}
        </div>
    )
}

export default function CheckoutPage() {
    const { items, total, isLoading: isCartLoading, fetchCart } = useCartStore()
    const { isAuthenticated, user } = useAuthStore()
    const router = useRouter()
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [summaryOpen, setSummaryOpen] = useState(false)
    
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
                <Link aria-label="Go back" href="/cart" className="text-[#1A1918] hover:text-[#C2BDB5] transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-[#1A1918] font-[family-name:var(--font-playfair)]">Shepherd Garde</h1>
                <div className="w-10"></div> 
            </header>

            <main className="w-full max-w-[600px] flex flex-col gap-8 pb-24">
                
                {/* Order Summary Accordion */}
                <div className="bg-[#FFFFFF] rounded-xl shadow-soft border border-[#E6E4DF] overflow-hidden transition-all duration-300">
                    <button 
                        type="button"
                        onClick={() => setSummaryOpen(!summaryOpen)}
                        className="w-full flex items-center justify-between p-6 cursor-pointer select-none focus:outline-none"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#1A1918]">shopping_bag</span>
                            <span className="font-medium text-[15px]">{summaryOpen ? 'Hide' : 'Show'} order summary</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-lg tracking-tight">${total.toFixed(2)}</span>
                            <span className={`material-symbols-outlined text-[#E6E4DF] transition-transform duration-300 ${summaryOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </div>
                    </button>
                    
                    {summaryOpen && (
                        <div className="px-6 pb-6 pt-2 border-t border-[#E6E4DF]/50">
                            <div className="flex flex-col gap-4 py-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                {items.length === 0 ? (
                                    <p className="text-sm text-[#E6E4DF]">Your cart is empty.</p>
                                ) : (
                                    items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative w-16 h-20 rounded bg-[#E6E4DF]/30 overflow-hidden shrink-0">
                                                <img 
                                                    alt={item.product?.name} 
                                                    src={item.product?.main_image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
                                                    className="object-cover w-full h-full"
                                                />
                                                <div className="absolute -top-2 -right-2 bg-[#2D2B2A] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium border border-white">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-[14px] leading-tight text-[#1A1918]">{item.product?.name}</h3>
                                                {item.variant && (
                                                    <p className="text-[#C2BDB5] text-[12px] uppercase tracking-wider mt-1">{item.variant.color} / {item.variant.size}</p>
                                                )}
                                            </div>
                                            <div className="font-medium text-[14px] text-[#1A1918]">${parseFloat(item.subtotal || '0').toFixed(2)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="py-4 border-t border-[#E6E4DF]/50 flex flex-col gap-2">
                                <div className="flex justify-between text-[14px] text-[#2D2B2A]/70">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[14px] text-[#2D2B2A]/70">
                                    <span>Shipping</span>
                                    <span>Calculated at next step</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-[#E6E4DF]/50 flex justify-between items-center">
                                <span className="font-medium text-[16px] text-[#1A1918]">Total</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[12px] text-[#C2BDB5] uppercase">USD</span>
                                    <span className="text-2xl font-semibold tracking-tight text-[#1A1918]">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    
                    {/* Contact Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold tracking-tight text-[#1A1918]">Contact</h2>
                            {!isAuthenticated && (
                                <Link href="/login" className="text-[14px] text-[#2D2B2A] underline underline-offset-4 decoration-[#E6E4DF] hover:decoration-[#2D2B2A] transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>
                        
                        <FloatingInput 
                            id="email" 
                            label="Email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                        />
                        
                        <div className="flex items-center gap-3">
                            <input 
                                id="news" 
                                type="checkbox" 
                                className="w-[18px] h-[18px] rounded-[4px] border-[#E6E4DF] text-[#1A1918] focus:ring-[#1A1918] focus:ring-offset-0 bg-[#FDFBF7] cursor-pointer"
                            />
                            <label htmlFor="news" className="text-[14px] text-[#2D2B2A]/80 cursor-pointer select-none pt-0.5">
                                Email me with news and exclusive drop offers
                            </label>
                        </div>
                    </section>

                    {/* Delivery Section */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold tracking-tight mb-2 text-[#1A1918]">Delivery</h2>
                        
                        <FloatingInput 
                            id="country" 
                            label="Country/Region" 
                            type="select" 
                            value={formData.country} 
                            onChange={handleInputChange} 
                            options={[
                                {value: 'US', label: 'United States'},
                                {value: 'UK', label: 'United Kingdom'},
                                {value: 'CA', label: 'Canada'},
                                {value: 'FR', label: 'France'},
                                {value: 'CO', label: 'Colombia'}
                            ]}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="firstName" label="First name" value={formData.firstName} onChange={handleInputChange} required />
                            <FloatingInput id="lastName" label="Last name" value={formData.lastName} onChange={handleInputChange} required />
                        </div>
                        
                        <FloatingInput id="address" label="Address" value={formData.address} onChange={handleInputChange} required />
                        <FloatingInput id="apartment" label="Apartment, suite, etc. (optional)" value={formData.apartment} onChange={handleInputChange} />
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <FloatingInput id="city" label="City" value={formData.city} onChange={handleInputChange} required />
                            </div>
                            <div className="col-span-1">
                                <FloatingInput id="state" label="State" value={formData.state} onChange={handleInputChange} required />
                            </div>
                            <div className="col-span-1">
                                <FloatingInput id="zip" label="ZIP code" value={formData.zip} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold tracking-tight text-[#1A1918]">Payment</h2>
                            <div className="flex items-center gap-1 text-[#C2BDB5]" title="Secure Encrypted Transaction">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                <span className="text-[12px] uppercase tracking-wider font-semibold pt-0.5">Secure</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#FFFFFF] border border-[#E6E4DF] rounded-xl overflow-hidden flex flex-col shadow-sm">
                            <div className="p-4 border-b border-[#E6E4DF] bg-[#FFFFFF] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        id="cc" 
                                        name="payment" 
                                        type="radio" 
                                        defaultChecked 
                                        className="w-[18px] h-[18px] text-[#1A1918] focus:ring-[#1A1918] focus:ring-offset-0 border-[#C2BDB5] bg-transparent cursor-pointer"
                                    />
                                    <label htmlFor="cc" className="font-semibold text-[14px] text-[#1A1918] cursor-pointer pt-0.5">Credit card</label>
                                </div>
                                <div className="flex gap-1.5 opacity-60">
                                    <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">VISA</div>
                                    <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">MC</div>
                                    <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">AMEX</div>
                                </div>
                            </div>
                            
                            <div className="p-5 bg-black/[0.02] flex flex-col gap-4">
                                <FloatingInput id="cardNumber" label="Card number" value={formData.cardNumber} onChange={handleInputChange} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput id="exp" label="Expiration date (MM / YY)" value={formData.exp} onChange={handleInputChange} required />
                                    <FloatingInput id="cvc" label="Security code" value={formData.cvc} onChange={handleInputChange} required />
                                </div>
                                <FloatingInput id="cardName" label="Name on card" value={formData.cardName} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </section>

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

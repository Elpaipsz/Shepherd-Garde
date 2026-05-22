"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import CartDrawer from '@/components/shop/CartDrawer'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { WeatherBanner } from '@/components/layout/WeatherBanner'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, logout, loadUser } = useAuthStore()
  const { setIsOpen: setCartOpen, items: cartItems } = useCartStore()

  useEffect(() => {
    setIsMounted(true)
    loadUser()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHome = pathname === '/'
  
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-[60]">
        <WeatherBanner />
      </div>
      <header className={clsx(
          "fixed left-0 right-0 z-50 transition-all duration-300", 
          isScrolled ? "top-0" : "top-8",
          isScrolled || !isHome ? "glass-nav shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Left part: Burger + Logo + Links */}
            <div className="flex items-center gap-8">
                {/* Mobile menu button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A]">
                    <span className="material-symbols-outlined text-2xl font-light">
                      {mobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
                <Link href="/" className="text-xl tracking-widest font-[family-name:var(--font-playfair)] font-medium text-[#2D2B2A]">
                  SHEPHERD GARDE
                </Link>
                
                <nav className="hidden lg:flex items-center gap-8 ml-8">
                    <Link href="/catalog" className="text-sm font-[family-name:var(--font-inter)] font-medium tracking-wide text-[#2D2B2A] hover:text-[#1A1918] transition-colors">
                      LATEST DROP
                    </Link>
                    <Link href="/catalog?collection=menswear" className="text-sm font-[family-name:var(--font-inter)] font-medium tracking-wide text-[#737373] hover:text-[#2D2B2A] transition-colors">
                      MENSWEAR
                    </Link>
                    <Link href="/catalog?collection=womenswear" className="text-sm font-[family-name:var(--font-inter)] font-medium tracking-wide text-[#737373] hover:text-[#2D2B2A] transition-colors">
                      WOMENSWEAR
                    </Link>
                    <Link href="/about" className="text-sm font-[family-name:var(--font-inter)] font-medium tracking-wide text-[#737373] hover:text-[#2D2B2A] transition-colors">
                      ABOUT
                    </Link>
                </nav>
            </div>

            {/* Right: Utilities */}
            <div className="flex items-center gap-6">
                <button className="hidden md:block p-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A]">
                    <span className="material-symbols-outlined text-xl font-light">search</span>
                </button>
                
                {isMounted ? (
                    isAuthenticated ? (
                      <div className="flex items-center gap-2">
                        <Link href="/account" className="hidden md:flex p-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A]" title={user?.first_name || 'My Account'}>
                            <span className="material-symbols-outlined text-xl font-light">person</span>
                        </Link>
                        <button onClick={logout} className="hidden sm:flex p-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A] hover:text-red-500" title="Sign Out">
                            <span className="material-symbols-outlined text-xl font-light">logout</span>
                        </button>
                      </div>
                    ) : (
                      <Link href="/login" className="hidden md:flex p-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A]">
                          <span className="material-symbols-outlined text-xl font-light">login</span>
                      </Link>
                    )
                ) : (
                    <div className="hidden md:flex p-2 w-9 h-9"></div>
                )}

                <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-black/5 rounded-full transition-colors group text-[#2D2B2A]">
                    <span className="material-symbols-outlined text-xl font-light group-hover:scale-110 transition-transform">shopping_bag</span>
                    {/* Cart Indicator */}
                    {isMounted && cartItems.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#1A1918] rounded-full"></span>
                    )}
                </button>
            </div>
        </div>

      </header>

      {/* Lateral Menu (Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-[#FDFBF7] shadow-2xl z-[60] flex flex-col lg:hidden"
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-[#E6E4DF]">
                    <span className="text-xl tracking-widest font-[family-name:var(--font-playfair)] font-medium text-[#2D2B2A]">
                        MENU
                    </span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors text-[#2D2B2A]">
                        <span className="material-symbols-outlined text-2xl font-light">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 text-[15px] font-bold tracking-widest text-[#2D2B2A]">
                    <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF] group">
                        LATEST DROP
                        <span className="material-symbols-outlined text-[#C2BDB5] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                    <Link href="/catalog?collection=menswear" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF] group">
                        MENSWEAR
                        <span className="material-symbols-outlined text-[#C2BDB5] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                    <Link href="/catalog?collection=womenswear" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-[#737373] hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF] group">
                        WOMENSWEAR
                        <span className="material-symbols-outlined text-[#C2BDB5] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                    
                    <div className="mt-auto pt-8 flex flex-col gap-6">
                        {isMounted ? (
                            isAuthenticated ? (
                                <>
                                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 hover:text-[#1A1918] transition-colors">
                                        <span className="material-symbols-outlined">person</span>
                                        MY ACCOUNT
                                    </Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors text-left">
                                        <span className="material-symbols-outlined">logout</span>
                                        SIGN OUT
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 hover:text-[#1A1918] transition-colors">
                                    <span className="material-symbols-outlined">login</span>
                                    LOGIN / REGISTER
                                </Link>
                            )
                        ) : null}
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <CartDrawer />
    </>
  )
}

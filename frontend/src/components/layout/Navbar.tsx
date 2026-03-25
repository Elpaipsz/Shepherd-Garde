"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import CartDrawer from '@/components/shop/CartDrawer'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

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
      <header className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300", 
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

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: '100vh', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-y-auto lg:hidden bg-[#FDFBF7] absolute top-[80px] left-0 w-full z-40 text-[#2D2B2A] border-t border-[#E6E4DF] shadow-soft"
              >
                  <div className="px-6 py-8 flex flex-col gap-6 text-xl text-center font-bold tracking-tight">
                      <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF]">LATEST DROP</Link>
                      <Link href="/catalog?collection=menswear" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF]">MENSWEAR</Link>
                      <Link href="/catalog?collection=womenswear" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1A1918] transition-colors pb-4 text-[#737373] border-b border-[#E6E4DF]">WOMENSWEAR</Link>
                      
                      {isMounted ? (
                          isAuthenticated ? (
                            <>
                              <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1A1918] transition-colors pb-4 border-b border-[#E6E4DF]">MY ACCOUNT</Link>
                              <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="hover:text-red-500 transition-colors mt-4 text-red-600">SIGN OUT</button>
                            </>
                          ) : (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1A1918] transition-colors mt-4">LOGIN / REGISTER</Link>
                          )
                      ) : null}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <CartDrawer />
    </>
  )
}

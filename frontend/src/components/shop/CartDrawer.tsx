import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'

const drawerVariants = {
  hidden: { x: '100%', transition: { duration: 0.5 } },
  visible: { x: 0, transition: { duration: 0.5 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

export default function CartDrawer() {
  const { 
    items, 
    total, 
    isOpen, 
    setIsOpen, 
    fetchCart, 
    removeItem, 
    updateQuantity,
    isLoading
  } = useCartStore()

  useEffect(() => {
     if (isOpen) {
         fetchCart()
     }
  }, [isOpen])

  const freeShippingThreshold = 200.00
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - total)
  const shippingProgress = Math.min(100, (total / freeShippingThreshold) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#1A1918]/60 backdrop-blur-md z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#FDFBF7] shadow-2xl z-[110] flex flex-col font-[family-name:var(--font-inter)] text-[#2D2B2A]"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#E6E4DF]">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]">
                Cart <span className="text-[#2D2B2A]/50">({items.length})</span>
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="group p-2 -mr-2 transition-transform hover:rotate-90"
              >
                <span className="material-symbols-outlined text-2xl font-light text-[#2D2B2A]">close</span>
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-[#FDFBF7] px-8 py-5 border-b border-[#E6E4DF]">
                {amountToFreeShipping > 0 ? (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D2B2A] text-center">
                        Add <span className="text-[#2D2B2A]/50">${amountToFreeShipping.toFixed(2)}</span> for free global shipping
                    </p>
                ) : (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 text-center">
                        Complimentary global shipping unlocked
                    </p>
                )}
                <div className="w-full h-[2px] bg-[#E6E4DF] mt-4 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full ${amountToFreeShipping === 0 ? 'bg-green-700' : 'bg-[#2D2B2A]'}`}
                    />
                </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6 relative">
              {isLoading && items.length === 0 && (
                  <div className="absolute inset-0 bg-[#FDFBF7]/50 flex items-center justify-center z-10 backdrop-blur-sm">
                      <div className="w-6 h-6 border-[2px] border-[#2D2B2A] border-t-transparent rounded-full animate-spin"></div>
                  </div>
              )}

              {!isLoading && items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 border border-[#E6E4DF] rounded-full flex items-center justify-center bg-[#FDFBF7] shadow-soft">
                      <span className="material-symbols-outlined text-2xl text-[#2D2B2A]/40 font-light">shopping_bag</span>
                  </div>
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2D2B2A]">Your bag is empty</p>
                      <p className="text-[11px] text-[#2D2B2A]/50 font-medium">Discover our latest pieces.</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="mt-4 border-b border-[#2D2B2A] text-[11px] font-bold uppercase tracking-widest pb-1 hover:text-[#2D2B2A]/70 hover:border-[#2D2B2A]/70 transition-all"
                  >
                    Return to Shop
                  </button>
                </div>
              ) : (
                <motion.div 
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-8"
                >
                  {items.map((item) => (
                    <motion.div 
                        key={item.id} 
                        variants={itemVariants}
                        exit="exit"
                        className="flex gap-5 group"
                    >
                      <Link 
                        href={`/products/${item.product?.slug || ''}`} 
                        onClick={() => setIsOpen(false)}
                        className="w-[100px] aspect-[4/5] bg-[#E6E4DF]/30 relative overflow-hidden flex-shrink-0"
                      >
                        <img 
                            src={item.product?.main_image || '/products/product1.png'} 
                            alt={item.product?.name || 'Product'} 
                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                      </Link>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link 
                                href={`/products/${item.product?.slug || ''}`} 
                                onClick={() => setIsOpen(false)} 
                                className="text-[11px] font-bold uppercase tracking-wider leading-relaxed hover:text-[#2D2B2A]/70 transition-colors pr-4"
                            >
                              {item.product?.name || 'Loading Piece...'}
                            </Link>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-[#2D2B2A]/40 hover:text-red-500 transition-colors shrink-0 p-1"
                              disabled={isLoading}
                              title="Remove item"
                            >
                              <span className="material-symbols-outlined text-[16px] font-light">close</span>
                            </button>
                          </div>
                          
                          {item.variant && (
                              <div className="mt-2 space-y-1">
                                  <p className="text-[10px] text-[#2D2B2A]/60 uppercase font-semibold tracking-wider">
                                      Color: <span className="text-[#2D2B2A]">{item.variant.color}</span>
                                  </p>
                                  <p className="text-[10px] text-[#2D2B2A]/60 uppercase font-semibold tracking-wider">
                                      Size: <span className="text-[#2D2B2A]">{item.variant.size}</span>
                                  </p>
                              </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          {/* Quantity Selector Minimalist */}
                          <div className="flex items-center border border-[#E6E4DF] rounded-sm h-8">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="w-8 h-full flex items-center justify-center hover:bg-[#E6E4DF]/30 transition-colors disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-[14px]">remove</span>
                            </button>
                            <span className="text-[11px] font-bold w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                              className="w-8 h-full flex items-center justify-center hover:bg-[#E6E4DF]/30 transition-colors disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                            </button>
                          </div>
                          <p className="text-[12px] font-bold tracking-wide">${parseFloat(item.subtotal || '0').toFixed(2)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-[#E6E4DF] bg-[#FDFBF7] p-8 space-y-6">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#2D2B2A]/60">
                        <span>Shipping</span>
                        <span>{amountToFreeShipping === 0 ? 'Complimentary' : 'Calculated at checkout'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-[#2D2B2A]">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <Link 
                    href="/checkout" 
                    onClick={() => setIsOpen(false)} 
                    className="group relative flex w-full items-center justify-center h-[54px] bg-[#2D2B2A] text-white overflow-hidden transition-all"
                >
                    <div className="absolute inset-0 bg-[#1A1918] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                        Proceed to Checkout 
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

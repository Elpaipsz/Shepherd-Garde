import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'

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

  // Keep cart synced if opened
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-background shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-sm font-black uppercase tracking-widest">Your Cart ({items.length})</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 hover:bg-muted transition-colors rounded-full text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-[#EAEAEA] p-4 text-center">
                {amountToFreeShipping > 0 ? (
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-primary">
                        You are <span className="text-muted-foreground">${amountToFreeShipping.toFixed(2)}</span> away from free global shipping
                    </p>
                ) : (
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-green-700">
                        You have unlocked Free Global Shipping!
                    </p>
                )}
                <div className="w-full h-1 bg-white mt-3 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`absolute top-0 left-0 h-full ${amountToFreeShipping === 0 ? 'bg-green-700' : 'bg-black'}`}
                    ></motion.div>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">
              {isLoading && items.length === 0 && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
              )}

              {!isLoading && items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <p className="text-xs font-bold uppercase tracking-widest">Your cart is empty.</p>
                  <button onClick={() => setIsOpen(false)} className="text-[11px] font-bold uppercase tracking-widest text-primary underline underline-offset-4 hover:text-muted-foreground transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 aspect-[4/5] bg-[#EAEAEA] flex-shrink-0">
                      {/* Assuming image comes from product, using a placeholder for now if missing */}
                      <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt={item.product?.name || 'Product'} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/products/${item.product?.slug || 'test'}`} onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-wide hover:text-muted-foreground transition-colors pr-4">
                            {item.product?.name || 'Loading Item...'}
                          </Link>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {item.variant && (
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
                                {item.variant.color} | {item.variant.size}
                            </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-border">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide">${parseFloat(item.subtotal || '0').toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-6 bg-background space-y-6">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <p className="text-[9px] text-muted-foreground text-center font-bold uppercase tracking-widest leading-relaxed">
                  Shipping, taxes, and discounts calculated at checkout.
                </p>
                <Link href="/checkout" onClick={() => setIsOpen(false)} className="block w-full bg-primary text-primary-foreground py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors">
                  Proceed to Checkout <span className="opacity-50 ml-2">→</span>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

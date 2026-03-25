"use client"

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { fetchAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { addItem, isLoading: isAddingToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  // Review state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
        try {
            const slug = unwrappedParams.id;
            if (!slug) throw new Error("Product ID is missing from URL.");

            const data = await fetchAPI(`/catalog/products/${slug}/`)
            setProduct(data)
            
            if (data.variants && data.variants.length > 0) {
                const uniqueSizes = Array.from(new Set(data.variants.map((v: any) => v.size)))
                const uniqueColors = Array.from(new Set(data.variants.map((v: any) => v.color)))
                if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0] as string)
                if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0] as string)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    loadProduct()
  }, [unwrappedParams.id])

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-[100px] pb-32 flex justify-center">
            <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] animate-pulse flex flex-col lg:flex-row gap-12 lg:gap-20">
                <div className="w-full lg:w-[60%] aspect-[4/5] bg-[#E6E4DF]/20 rounded-md"></div>
                <div className="w-full lg:w-[40%] space-y-6 pt-12">
                    <div className="h-10 bg-[#E6E4DF]/40 w-3/4 rounded-md"></div>
                    <div className="h-6 bg-[#E6E4DF]/40 w-1/4 rounded-md"></div>
                    <div className="h-24 bg-[#E6E4DF]/40 w-full rounded-md mt-8"></div>
                </div>
            </div>
        </div>
    )
  }

  if (error || !product) {
     return <div className="min-h-screen flex items-center justify-center text-red-500 text-sm font-bold uppercase tracking-widest bg-[#FDFBF7]">Error loading piece: {error}</div>
  }

  const sizes = Array.from(new Set(product.variants.map((v: any) => v.size)))
  const colors = Array.from(new Set(product.variants.map((v: any) => v.color)))
  
  const reviewsCount = product.reviews?.length || 0;
  const averageRating = reviewsCount > 0 
    ? Math.round(product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount) 
    : 5;
  
  const activeVariant = product.variants.find((v: any) => v.size === selectedSize && v.color === selectedColor)
  const currentPrice = activeVariant?.price_override || product.base_price
  const isOutOfStock = activeVariant?.stock === 0
  const isAvailable = true 

  const PRODUCT_IMAGES: Record<string, string> = {
    'shadow-shell-jacket': '/products/product1.png',
    'pilgrim-comfort-pant': '/products/product2.png',
    'essential-black-tee': '/products/product3.png',
  }

  const images = product.main_image 
    ? [product.main_image] 
    : [PRODUCT_IMAGES[product.slug] || '/products/product1.png']

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color")
      return
    }
    const variant = product.variants.find((v: any) => v.size === selectedSize && v.color === selectedColor)
    if (!variant) {
        alert("This variant is currently unavailable")
        return
    }
    try {
        await addItem(variant.id, quantity)
    } catch (error) {
        alert("Failed to add item to cart. Please try again.")
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isAuthenticated) return

      setIsSubmittingReview(true)
      try {
          await fetchAPI(`/catalog/products/${product.id}/reviews/`, {
              method: 'POST',
              body: JSON.stringify({
                  rating: reviewRating,
                  title: 'Review',
                  body: reviewComment
              })
          })
          alert("Review submitted successfully!")
          window.location.reload()
      } catch (err: any) {
          alert(err.message || "Failed to submit review")
          setIsSubmittingReview(false)
      } 
  }

  return (
    <div className="bg-[#FDFBF7] text-[#2D2B2A] min-h-screen flex flex-col selection:bg-black selection:text-white pt-24 font-[family-name:var(--font-inter)]">
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-[#E6E4DF] font-medium tracking-widest uppercase flex items-center gap-2">
                <Link href="/catalog" className="text-[#2D2B2A]/50 hover:text-[#2D2B2A] transition-colors">Catalog</Link>
                <span className="text-[#E6E4DF] material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-[#2D2B2A] truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 relative items-start">
                {/* Left: Image */}
                <div className="w-full lg:flex-1 flex flex-col gap-8">
                    {images.map((img, idx) => (
                        <div key={idx} className="w-full bg-[#E6E4DF]/20 rounded-md overflow-hidden relative shadow-soft">
                            <img alt={`${product.name} detail ${idx + 1}`} className="w-full h-auto object-cover" src={img}/>
                        </div>
                    ))}
                </div>

                {/* Right: Sticky Details Panel */}
                <div className="w-full lg:w-[480px] lg:sticky lg:top-[120px] flex flex-col pt-4 pb-24 lg:pb-8 h-auto lg:max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-2">
                    <div className="mb-2 flex items-center gap-3">
                        <span className="uppercase tracking-widest text-xs font-semibold text-[#2D2B2A]/60">Drop Showcase</span>
                    </div>
                    
                    <h1 className="text-4xl lg:text-[40px] font-bold tracking-tight text-[#2D2B2A] leading-tight mb-4">{product.name}</h1>
                    
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-lg font-medium text-[#2D2B2A] tracking-wide">${parseFloat(currentPrice).toFixed(2)}</span>
                        
                        {reviewsCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-[#2D2B2A]/80">
                                <span className="font-medium">{averageRating.toFixed(1)} / 5.0</span>
                                <div className="w-8 h-[1px] bg-[#E6E4DF]"></div>
                                <a className="text-[#2D2B2A] hover:underline underline-offset-4 decoration-[#E6E4DF] transition-all" href="#reviews">{reviewsCount} Reviews</a>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-[1px] w-full bg-[#E6E4DF]/50 mb-8"></div>
                    
                    <p className="text-[15px] leading-relaxed text-[#2D2B2A]/80 font-light mb-10">
                        {product.description || "A study in structural restraint. Crafted from a dense, water-repellent cotton gabardine, this silhouette features dramatically dropped shoulders, a hidden placket, and a soft, fluid drape that defies its substantial weight. Unlined for trans-seasonal layering."}
                    </p>

                    {/* Color Selector */}
                    {colors.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs uppercase tracking-widest font-semibold text-[#2D2B2A]">Select Color</span>
                                <span className="text-xs text-[#2D2B2A]/60">{selectedColor}</span>
                            </div>
                            <div className="flex gap-2">
                                {colors.map((color: any) => (
                                    <button 
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-12 h-14 border rounded-md transition-all overflow-hidden ${selectedColor === color ? 'border-[#2D2B2A] shadow-soft scale-105' : 'border-[#E6E4DF] hover:border-[#2D2B2A]/50'}`}
                                    >
                                        <div className="w-full h-full bg-[#E6E4DF]/30 flex items-center justify-center text-xs font-bold text-[#2D2B2A]/30">
                                           {color.substring(0,2).toUpperCase()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selector */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs uppercase tracking-widest font-semibold text-[#2D2B2A]">Select Size</span>
                            <button className="text-xs text-[#2D2B2A]/60 hover:text-[#2D2B2A] transition-colors underline underline-offset-4 decoration-[#E6E4DF]">Size Guide</button>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                                const isAvailableSize = sizes.includes(size);
                                const isSelected = selectedSize === size;
                                
                                if (!isAvailableSize) {
                                    return (
                                        <button key={size} className="h-12 border border-[#E6E4DF] rounded-md flex items-center justify-center text-sm font-medium text-[#2D2B2A]/40 bg-[#FDFBF7]/50 cursor-not-allowed relative overflow-hidden">
                                            {size}
                                            <div className="absolute inset-0 flex items-center justify-center w-full h-full rotate-45 pointer-events-none">
                                                <div className="w-[150%] h-[1px] bg-[#E6E4DF]"></div>
                                            </div>
                                        </button>
                                    )
                                }
                                
                                return (
                                    <button 
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 border rounded-md flex items-center justify-center text-sm transition-all ${isSelected ? 'border-[1.5px] border-primary font-bold shadow-soft transform scale-[1.02]' : 'border-[#E6E4DF] font-medium text-[#2D2B2A] hover:border-[#2D2B2A] bg-[#FDFBF7]'}`}
                                    >
                                        {size}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-[#2D2B2A]/50 mt-3 font-light">Model is 175cm / 5'9" and wears size M.</p>
                    </div>

                    {/* Add to Bag CTA */}
                    <div className="mt-auto pt-4 pb-2 bg-[#FDFBF7] z-10 sticky bottom-0">
                        <button 
                            onClick={handleAddToCart}
                            disabled={!isAvailable || isOutOfStock || isAddingToCart}
                            className={`w-full h-14 rounded-md font-medium tracking-wide text-[15px] transition-all flex items-center justify-center gap-2 group ${(!isAvailable || isOutOfStock) ? 'bg-[#E6E4DF] text-[#2D2B2A]/50 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 hover:shadow-float'}`}
                        >
                            <span>{isAddingToCart ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                            {!isAddingToCart && !isOutOfStock && <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100 transition-opacity">shopping_bag</span>}
                        </button>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-[#2D2B2A]/70 font-light">
                                <span className="material-symbols-outlined text-[18px] opacity-50">local_shipping</span>
                                <span>Complimentary global shipping on all orders.</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#2D2B2A]/70 font-light">
                                <span className="material-symbols-outlined text-[18px] opacity-50">assignment_return</span>
                                <span>14-day return window.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section at bottom */}
            <div id="reviews" className="mt-32 pt-16 border-t border-[#E6E4DF] max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-bold tracking-tight text-[#2D2B2A]">Client Reviews</h2>
                    <div className="text-sm font-medium text-[#2D2B2A]/70">
                        {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0 Average` : 'No reviews yet'}
                    </div>
                </div>
                
                <div className="space-y-8 mb-16">
                    {product.reviews?.length > 0 ? (
                        product.reviews.map((review: any, idx: number) => (
                            <div key={idx} className="bg-white p-6 rounded-lg shadow-soft border border-[#E6E4DF]/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-primary text-sm mb-2 flex gap-1">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                        <span className="font-semibold text-sm text-[#2D2B2A]">{review.user_name || "Verified Buyer"}</span>
                                    </div>
                                    <span className="text-xs text-[#2D2B2A]/50 uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-[#2D2B2A]/80 leading-relaxed">{review.body}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-[#2D2B2A]/60 italic">Be the first to review this piece.</p>
                    )}
                </div>
                
                {isAuthenticated ? (
                    <div className="bg-[#FDFBF7] border border-[#E6E4DF] p-8 rounded-lg shadow-soft">
                        <h4 className="text-sm font-semibold uppercase tracking-widest mb-6 text-[#2D2B2A]">Leave a Review</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium text-[#2D2B2A]/70 block mb-3">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            onClick={() => setReviewRating(star)}
                                            className={`text-2xl transition-colors ${reviewRating >= star ? 'text-[#2D2B2A]' : 'text-[#E6E4DF] hover:text-[#2D2B2A]/50'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium text-[#2D2B2A]/70 block mb-3">Comment</label>
                                <textarea 
                                    required
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full bg-white border border-[#E6E4DF] rounded-md text-sm p-4 focus:outline-none focus:border-[#2D2B2A] focus:ring-1 focus:ring-[#2D2B2A] transition-all min-h-[120px]"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmittingReview}
                                className="px-8 py-3 bg-black text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black/90 hover:shadow-soft disabled:opacity-50 transition-all"
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-8 border border-[#E6E4DF] border-dashed rounded-lg text-center">
                        <p className="text-sm text-[#2D2B2A]/60 mb-4">You must be logged in to share a review.</p>
                        <Link href="/login" className="inline-flex items-center justify-center px-6 py-2 border border-[#2D2B2A] rounded-md text-xs font-bold uppercase tracking-widest text-[#2D2B2A] hover:bg-[#2D2B2A] hover:text-white transition-all">
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </main>
    </div>
  )
}

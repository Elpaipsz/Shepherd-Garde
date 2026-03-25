"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import Link from 'next/link'
import { fetchAPI } from '@/lib/api'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
     const loadFeatured = async () => {
         try {
             const collectionsResponse = await fetchAPI('/catalog/collections/?is_preview=true')
             const dropsCollection = collectionsResponse.results || collectionsResponse
             let showcase: any[] = []
             if (dropsCollection.length > 0) {
                 const productsResponse = await fetchAPI(`/catalog/products/?collection__slug=${dropsCollection[0].slug}`)
                 const dropProducts = productsResponse.results || productsResponse
                 showcase = [...dropProducts.slice(0, 3).map((p: any) => ({ ...p, isDrop: true }))]
             }
             setFeaturedProducts(showcase)
         } catch (err) {
             console.error("Home Page Fetch Error:", err)
         } finally {
             setIsLoading(false)
         }
     }
     loadFeatured();
  }, [])

  const getProductImage = (idx: number) => {
      const images = [
          '/products/product1.png',
          '/products/product2.png',
          '/products/product3.png'
      ]
      return images[idx % images.length]
  }

  return (
    <div className="flex-grow pt-[80px] w-full">
      {/* Hero Section */}
      <section className="w-full h-[calc(100vh-80px)] p-6 hero-container group max-w-[2000px] mx-auto">
        <div className="relative w-full h-full rounded-[16px] overflow-hidden hero-media shadow-float bg-[#FFFFFF] transition-transform duration-1000 group-hover:scale-[0.98]">
          {/* Hero Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/banner.jpeg')" }}
          >
            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"></div>
          </div>
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6 text-center z-10 text-[#FFFFFF]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="text-5xl md:text-7xl font-black font-[family-name:var(--font-playfair)] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6 leading-tight uppercase">
                Drop 04<br/>
                <span className="font-light tracking-widest text-4xl md:text-5xl opacity-90">The Sculptor</span>
              </h1>
              
              {/* Floating CTA */}
              <Link 
                href="/catalog" 
                className="bg-[#FFFFFF] text-[#1A1918] h-14 px-10 rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-400 hover:scale-105 hover:bg-[#1A1918] hover:text-[#FFFFFF] shadow-float flex items-center justify-center gap-2"
              >
                <span>Explore Drop 04</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Teaser Grid Section (Below Fold) */}
      <section className="px-6 lg:px-10 py-24 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h3 className="text-2xl font-[family-name:var(--font-playfair)] font-medium uppercase tracking-tight text-[#2D2B2A]">Curated Selection</h3>
          <Link 
            href="/catalog" 
            className="text-sm font-medium uppercase tracking-wider border-b border-[#2D2B2A] pb-1 text-[#2D2B2A] hover:text-[#C2BDB5] hover:border-[#C2BDB5] transition-colors"
          >
            View Catalog
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className={`animate-pulse ${idx === 1 ? 'md:mt-16' : ''}`}>
                    <div className="aspect-[4/5] rounded-[16px] bg-[#E6E4DF]/50 mb-4"></div>
                    <div className="h-4 bg-[#E6E4DF]/50 w-2/3 mb-2"></div>
                    <div className="h-4 bg-[#E6E4DF]/50 w-1/3"></div>
                </div>
             ))
          ) : featuredProducts.map((product, idx) => (
             <Link 
               key={product.id} 
               href={`/products/${product.slug}`} 
               className={`group block ${idx === 1 ? 'md:mt-16' : ''}`}
             >
               <div className="aspect-[4/5] rounded-[16px] overflow-hidden bg-[#F3EDE7] mb-4 relative shadow-soft transition-all duration-500 group-hover:shadow-float group-hover:-translate-y-1">
                 <div 
                   className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                   style={{ backgroundImage: `url(${product.image_url || getProductImage(idx)})` }}
                 />
                 {/* Soft overlay on hover */}
                 <div className="absolute inset-0 bg-[#1A1918]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               </div>
               
               <div className="flex justify-between items-start text-[#2D2B2A]">
                 <div>
                   <h4 className="text-sm font-bold uppercase tracking-wide">{product.name}</h4>
                   <p className="text-xs text-[#737373] mt-1 uppercase tracking-wider font-medium">
                      {product.color || "Alabaster"}
                   </p>
                 </div>
                 <span className="text-sm font-medium">${parseFloat(product.base_price).toFixed(2)}</span>
               </div>
             </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

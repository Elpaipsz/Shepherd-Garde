"use client"

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { fetchAPI } from '@/lib/api'
import FilterDrawer, { FilterState } from '@/components/shop/FilterDrawer'

export default function Catalog({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
    const unwrappedParams = use(searchParams);
    const filterType = unwrappedParams.collection || 'all';
    
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<FilterState>({ sizes: [], collections: [], ordering: '' })

    useEffect(() => {
        const loadCatalog = async () => {
            setIsLoading(true)
            try {
                // Build query params from active filters
                const params = new URLSearchParams()
                if (activeFilters.sizes.length > 0) params.set('size', activeFilters.sizes.join(','))
                if (activeFilters.ordering) params.set('ordering', activeFilters.ordering)

                const isPreview = filterType === 'drops' ? 'true' : 'false'
                const collectionsData = await fetchAPI(`/catalog/collections/?is_preview=${isPreview}`)
                
                let allProducts: any[] = []
                for (const collection of collectionsData.results || collectionsData) {
                    const qs = params.toString()
                    const productsResponse = await fetchAPI(`/catalog/products/?collection__slug=${collection.slug}${qs ? '&' + qs : ''}`)
                    const productsData = productsResponse.results || productsResponse
                    const processedProducts = productsData.map((p: any) => ({
                        ...p,
                        isDrop: collection.is_preview,
                        collectionName: collection.name
                    }))
                    allProducts = [...allProducts, ...processedProducts]
                }
                
                setProducts(allProducts)
            } catch (err: any) {
                console.error("Failed to fetch catalog", err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadCatalog()
    }, [filterType, activeFilters])

    const PRODUCT_IMAGES: Record<string, string> = {
        'shadow-shell-jacket': '/products/product1.png',
        'pilgrim-comfort-pant': '/products/product2.png',
        'essential-black-tee': '/products/product3.png',
    }

    const getProductImage = (product: any, idx: number) => {
        if (product.main_image) return product.main_image;
        return PRODUCT_IMAGES[product.slug] || '/products/product1.png'
    }

  return (
        <div className="min-h-screen pt-[100px] pb-32">
            <div className="px-6 lg:px-12 w-full max-w-[1600px] mx-auto">
                
                {/* Header & Filter/Sort Utility Bar */}
                <div className="flex justify-between items-end mb-12 py-4 border-b border-[#E6E4DF] text-[11px] uppercase font-bold tracking-widest text-[#2D2B2A]">
                    <div className="flex flex-col gap-2">
                        <span className="text-3xl font-[family-name:var(--font-playfair)] tracking-tight text-[#2D2B2A] capitalize">
                            {filterType === 'drops' ? 'Prestige Drops' : 'Catalog'}
                        </span>
                        <div className="flex gap-6 text-[10px] text-[#737373] pt-1">
                            <Link href="/catalog" className={`transition-colors hover:text-[#1A1918] ${filterType !== 'drops' ? 'text-[#1A1918] border-b border-[#1A1918] pb-1' : ''}`}>
                                Menswear
                            </Link>
                            <Link href="/catalog?collection=drops" className={`transition-colors hover:text-[#1A1918] ${filterType === 'drops' ? 'text-[#1A1918] border-b border-[#1A1918] pb-1' : ''}`}>
                                Prestige Drops
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pb-1">
                        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 hover:text-[#737373] transition-colors group">
                            FILTER <span className="text-[14px] font-light leading-none group-hover:text-[#737373]">+</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, idx) => (
                           <div key={idx} className="animate-pulse mb-8">
                               <div className="w-full aspect-[3/4] rounded-[16px] bg-[#E6E4DF]/30 mb-4"></div>
                               <div className="h-4 bg-[#E6E4DF]/30 w-2/3 mb-2"></div>
                               <div className="h-4 bg-[#E6E4DF]/30 w-1/3"></div>
                           </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-800 text-xs font-bold uppercase tracking-widest border border-red-800/20 max-w-2xl mx-auto rounded-[16px]">
                        <p className="mb-2">Error loading catalog</p>
                        <p className="text-[#737373] font-normal">{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32 rounded-[16px] bg-[#E6E4DF]/10">
                        <p className="text-xs text-[#737373] uppercase tracking-widest font-bold">No garments found in this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 mt-12">
                        {products.map((product, idx) => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (idx % 8) * 0.05 }}
                                className="group block"
                            >
                                <Link href={`/products/${product.slug}`} className="block w-full h-full">
                                    <div className="rounded-[16px] overflow-hidden bg-[#F3EDE7] mb-4 relative shadow-soft transition-all duration-500 group-hover:shadow-float group-hover:-translate-y-1">
                                        <div className="relative w-full aspect-[3/4]">
                                            {product.isDrop && (
                                                <div className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest text-[#2D2B2A] bg-[#FFFFFF]/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                                                    PRESTIGE
                                                </div>
                                            )}
                                            <div 
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                                                style={{ backgroundImage: `url(${getProductImage(product, idx)})` }}
                                            />
                                            {/* Soft overlay on hover */}
                                            <div className="absolute inset-0 bg-[#1A1918]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            
                                            {/* Quick Add Button */}
                                            <button 
                                              className="absolute bottom-4 right-4 bg-[#FFFFFF]/90 backdrop-blur-sm shadow-soft rounded-full size-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 text-[#2D2B2A] hover:bg-[#1A1918] hover:text-[#FFFFFF]"
                                              onClick={(e) => { e.preventDefault(); /* Hook up quick add logic later */ }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Product Metadata */}
                                    <div className="flex justify-between items-start mt-4 px-1 text-[#2D2B2A]">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wide group-hover:text-[#737373] transition-colors">{product.name}</h4>
                                            <p className="text-xs text-[#737373] mt-1 uppercase tracking-wider font-medium">
                                                {product.collectionName || (product.isDrop ? "Prestige Drop" : "Core Collection")}
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium">${parseFloat(product.base_price).toFixed(2)}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={setActiveFilters}
                activeFilters={activeFilters}
            />
        </div>
    )
}

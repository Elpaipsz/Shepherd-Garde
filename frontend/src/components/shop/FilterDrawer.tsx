import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

export interface FilterState {
    sizes: string[]
    collections: string[]
    ordering: string
}

interface FilterDrawerProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: FilterState) => void
    activeFilters: FilterState
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
    { label: 'Newest', value: '-created_at' },
    { label: 'Price: Low to High', value: 'base_price' },
    { label: 'Price: High to Low', value: '-base_price' },
    { label: 'Name A-Z', value: 'name' },
]

export default function FilterDrawer({ isOpen, onClose, onApply, activeFilters }: FilterDrawerProps) {
    const [local, setLocal] = useState<FilterState>(activeFilters)

    const toggleSize = (size: string) => {
        setLocal(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }))
    }

    const handleApply = () => {
        onApply(local)
        onClose()
    }

    const handleClear = () => {
        const empty: FilterState = { sizes: [], collections: [], ordering: '' }
        setLocal(empty)
        onApply(empty)
        onClose()
    }

    const activeCount =
        local.sizes.length +
        local.collections.length +
        (local.ordering ? 1 : 0)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background shadow-2xl z-[110] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-black uppercase tracking-widest">Filter & Sort</h2>
                                {activeCount > 0 && (
                                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5">
                                        {activeCount}
                                    </span>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 -mr-2 hover:bg-muted transition-colors rounded-full text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">

                            {/* Sort By */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Sort By</h3>
                                <div className="space-y-2">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLocal(prev => ({ ...prev, ordering: prev.ordering === opt.value ? '' : opt.value }))}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide border transition-colors ${local.ordering === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:border-foreground'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Size</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {SIZES.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => toggleSize(size)}
                                            className={`border py-3 text-xs font-bold uppercase tracking-widest transition-colors ${local.sizes.includes(size) ? 'border-primary bg-primary text-primary-foreground' : 'border-border/50 hover:border-foreground'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border/50 p-6 bg-background space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 border border-border py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-1 bg-primary text-primary-foreground py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

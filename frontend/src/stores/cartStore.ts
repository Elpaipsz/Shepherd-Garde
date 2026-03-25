import { create } from 'zustand'
import { fetchAPI } from '@/lib/api'

interface CartItem {
    id: string;
    product: {
        id: string;
        name: string;
        slug: string;
        base_price: string;
        main_image: string | null;
    };
    variant: {
        id: string;
        size: string;
        color: string;
        sku: string;
    };
    quantity: number;
    subtotal: string;
}

interface CartState {
    items: CartItem[];
    total: number;
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    setIsOpen: (isOpen: boolean) => void;
    fetchCart: () => Promise<void>;
    addItem: (variantId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    total: 0,
    isOpen: false,
    isLoading: false,
    error: null,

    setIsOpen: (isOpen: boolean) => set({ isOpen }),

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            // Requires auth or a session ID. For now we assume the user is logged in, 
            // or the backend supports anonymous carts via session.
            const response = await fetchAPI('/shop/cart/');
            
            if (response.session_id && typeof window !== 'undefined') {
                localStorage.setItem('sg_cart_session', response.session_id);
            }

            // Calculate total from items since backend might not return a grand total directly
            // or we calculate it here for display.
            const total = response.items.reduce((acc: number, item: any) => acc + parseFloat(item.subtotal), 0);
            
            set({ items: response.items, total, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            console.error("Failed to fetch cart", error);
        }
    },

    addItem: async (variantId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
            await fetchAPI('/shop/cart/items/', {
                method: 'POST',
                body: JSON.stringify({
                    variant_id: variantId,
                    quantity: quantity
                })
            });
            
            // Refresh cart after adding
            await get().fetchCart();
            // Automatically open drawer
            set({ isOpen: true, isLoading: false });
        } catch (error: any) {
             set({ error: error.message, isLoading: false });
             console.error("Failed to add item to cart", error);
             throw error; // Re-throw so UI can show toast if needed
        }
    },

    removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
            await fetchAPI(`/shop/cart/items/${itemId}/`, {
                method: 'DELETE'
            });
            await get().fetchCart();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            console.error("Failed to remove item", error);
        }
    },

    updateQuantity: async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        set({ isLoading: true, error: null });
        try {
            await fetchAPI(`/shop/cart/items/${itemId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ quantity })
            });
            await get().fetchCart();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            console.error("Failed to update quantity", error);
        }
    }
}));

import { useState } from 'react';

export const OrderSummary = ({ items, total }: { items: any[], total: number }) => {
    const [summaryOpen, setSummaryOpen] = useState(false);
    
    return (
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
    );
};

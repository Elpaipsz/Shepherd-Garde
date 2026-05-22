import { FloatingInput } from './FloatingInput';

export const PaymentSection = ({ formData, handleInputChange }: { formData: any, handleInputChange: any }) => {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-tight text-[#1A1918]">Payment</h2>
                <div className="flex items-center gap-1 text-[#C2BDB5]" title="Secure Encrypted Transaction">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span className="text-[12px] uppercase tracking-wider font-semibold pt-0.5">Secure</span>
                </div>
            </div>
            
            <div className="bg-[#FFFFFF] border border-[#E6E4DF] rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-[#E6E4DF] bg-[#FFFFFF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input 
                            id="cc" 
                            name="payment" 
                            type="radio" 
                            defaultChecked 
                            className="w-[18px] h-[18px] text-[#1A1918] focus:ring-[#1A1918] focus:ring-offset-0 border-[#C2BDB5] bg-transparent cursor-pointer"
                        />
                        <label htmlFor="cc" className="font-semibold text-[14px] text-[#1A1918] cursor-pointer pt-0.5">Credit card</label>
                    </div>
                    <div className="flex gap-1.5 opacity-60">
                        <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">VISA</div>
                        <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">MC</div>
                        <div className="w-9 h-6 bg-[#FDFBF7] border border-[#E6E4DF] rounded flex items-center justify-center text-[8px] font-bold text-[#2D2B2A]/50 tracking-wider">AMEX</div>
                    </div>
                </div>
                
                <div className="p-5 bg-black/[0.02] flex flex-col gap-4">
                    <FloatingInput id="cardNumber" label="Card number" value={formData.cardNumber} onChange={handleInputChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <FloatingInput id="exp" label="Expiration date (MM / YY)" value={formData.exp} onChange={handleInputChange} required />
                        <FloatingInput id="cvc" label="Security code" value={formData.cvc} onChange={handleInputChange} required />
                    </div>
                    <FloatingInput id="cardName" label="Name on card" value={formData.cardName} onChange={handleInputChange} required />
                </div>
            </div>
        </section>
    );
};

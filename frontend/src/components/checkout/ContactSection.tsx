import Link from 'next/link';
import { FloatingInput } from './FloatingInput';

export const ContactSection = ({ formData, handleInputChange, mounted, isAuthenticated }: { formData: any, handleInputChange: any, mounted: boolean, isAuthenticated: boolean }) => {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-tight text-[#1A1918]">Contact</h2>
                {mounted && !isAuthenticated && (
                    <Link href="/login" className="text-[14px] text-[#2D2B2A] underline underline-offset-4 decoration-[#E6E4DF] hover:decoration-[#2D2B2A] transition-colors">
                        Login
                    </Link>
                )}
            </div>
            
            <FloatingInput 
                id="email" 
                label="Email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
            />
            
            <div className="flex items-center gap-3">
                <input 
                    id="news" 
                    type="checkbox" 
                    className="w-[18px] h-[18px] rounded-[4px] border-[#E6E4DF] text-[#1A1918] focus:ring-[#1A1918] focus:ring-offset-0 bg-[#FDFBF7] cursor-pointer"
                />
                <label htmlFor="news" className="text-[14px] text-[#2D2B2A]/80 cursor-pointer select-none pt-0.5">
                    Email me with news and exclusive drop offers
                </label>
            </div>
        </section>
    );
};

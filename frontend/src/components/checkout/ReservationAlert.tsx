import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const ReservationAlert = () => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(900); // 15:00 minutes
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        if (timeLeft <= 0) {
            router.push('/cart?error=reservation_expired');
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, router]);

    if (!mounted) return null;

    return (
        <div className={`bg-[#1A1918] border border-[#1A1918] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-700 transform hover:scale-[1.01] ${timeLeft < 60 ? 'bg-red-600 border-red-600 animate-pulse' : ''}`}>
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${timeLeft < 60 ? 'bg-white text-red-600' : 'bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/20'}`}>
                    <span className="material-symbols-outlined text-[28px]">{timeLeft < 60 ? 'error' : 'schedule'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-white/60 uppercase tracking-[0.2em]">Secure Reservation</span>
                    <h2 className="text-[18px] font-bold text-white tracking-tight">Your stock is locked for this session</h2>
                </div>
            </div>
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                <span className="text-[9px] text-white/50 uppercase font-black tracking-[0.15em] mb-2">Checkout expires in</span>
                <div className={`font-mono text-3xl font-black px-6 py-3 rounded-xl border-2 tabular-nums transition-all duration-300 shadow-xl
                    ${timeLeft < 60 ? 'bg-white border-white text-red-600 scale-110' : 'bg-white/10 border-white/20 text-white backdrop-blur-md'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    );
};

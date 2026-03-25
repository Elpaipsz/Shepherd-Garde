import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10 px-6 lg:px-12 w-full mt-auto">
      <div className="max-w-[1800px] mx-auto">
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-8 pr-10">
            <h2 className="text-2xl font-black uppercase tracking-tight">SHEPHERD GARDE</h2>
            <div className="space-y-4 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-background/60">Subscribe for early access to drops and exclusive content.</p>
                <div className="flex items-center border-b border-background/30 py-2">
                    <input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full placeholder:text-background/30"
                    />
                    <button className="text-background hover:text-background/60 transition-colors">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
          </div>

          {/* Links: Shop */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="/catalog" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">All Products</Link></li>
              <li><Link href="/catalog?collection=drops" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">Prestige Drops</Link></li>
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">The Vault</Link></li>
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">Essentials</Link></li>
            </ul>
          </div>

          {/* Links: Support */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">FAQ</Link></li>
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">Contact Us</Link></li>
              <li><Link href="/" className="text-xs font-medium uppercase tracking-wide text-background/60 hover:text-background transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-background/20 text-[10px] font-bold uppercase tracking-wider text-background/40">
            <div className="flex gap-4 mb-4 md:mb-0">
                <Link href="/" className="hover:text-background transition-colors">Privacy Policy</Link>
                <Link href="/" className="hover:text-background transition-colors">Terms of Service</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} SHEPHERD GARDE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}

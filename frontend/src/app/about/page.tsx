"use client"

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop" 
                        alt="Shepherd Garde Origins" 
                        className="w-full h-full object-cover grayscale"
                    />
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase"
                    >
                        Our Origins
                    </motion.h1>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4 lg:px-8 max-w-4xl">
                <div className="space-y-12 text-lg text-muted-foreground font-light leading-relaxed">
                    <p className="text-2xl text-primary font-medium leading-snug">
                        Shepherd Garde was born from the intersection of functional utility and high-end street aesthetics. We don't just make clothes; we engineer garments for the modern urban landscape.
                    </p>
                    <p>
                        Founded in 2026, our mission has always been to provide exclusive, limited-run pieces that blur the line between tactical gear and avant-garde fashion. Every stitch, every pocket, and every fabric choice is meticulously considered to offer maximum durability without compromising on silhouette.
                    </p>
                    <div className="pt-8 border-t border-border">
                        <Link href="/catalog" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider hover:text-muted-foreground transition-colors">
                            Explore the collection <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

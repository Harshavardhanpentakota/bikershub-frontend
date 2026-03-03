import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const perks = [
  { icon: <Truck size={22} />,       title: 'Free Shipping',      desc: 'On orders above ₹999' },
  { icon: <RotateCcw size={22} />,   title: 'Easy Returns',       desc: '30-day hassle-free returns' },
  { icon: <ShieldCheck size={22} />, title: 'Genuine Products',   desc: '100% authentic gear' },
  { icon: <Headphones size={22} />,  title: '24/7 Support',       desc: 'Rider-first customer care' },
];

export default function PromoBanner() {
  return (
    <>
      {/* ── Trust Bar ── */}
      <section className="bg-foreground text-background py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(p => (
              <div key={p.title} className="flex items-center gap-3">
                <span className="text-primary flex-shrink-0">{p.icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-none">{p.title}</p>
                  <p className="text-xs text-background/50 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full-Width Promotional Banner ── */}
      <section
        className="relative overflow-hidden bg-cover bg-center py-16 md:py-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&h=500&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-foreground/75" />
        <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Members-Only Benefits
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight">
              Join the BikersHub<br className="hidden md:block" /> Riders Club
            </h2>
            <p className="mt-3 text-white/60 text-sm max-w-md">
              Unlock exclusive discounts, early access to new drops, free shipping on every order, and priority support — only for members.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/signup"
              className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold hover:bg-accent transition-colors text-center btn-press"
            >
              Join Free — It's Quick
            </Link>
            <Link
              to="/shop"
              className="border border-white/30 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors text-center"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

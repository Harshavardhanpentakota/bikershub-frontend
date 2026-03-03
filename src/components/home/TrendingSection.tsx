import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const editorials = [
  {
    title: 'Winter Riding',
    subtitle: 'Stay warm, stay safe',
    path: '/shop?category=Winter+Gear',
    image: 'https://images.unsplash.com/photo-1609631700683-85843a0c1135?w=600&h=750&fit=crop',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    title: 'Performance Helmets',
    subtitle: 'DOT & ECE certified',
    path: '/shop?category=Helmets',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f7e7?w=600&h=380&fit=crop',
    span: 'md:col-span-1',
  },
  {
    title: 'Casual Apparel',
    subtitle: 'Style on and off the bike',
    path: '/shop?category=Riding+Gears',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=380&fit=crop',
    span: 'md:col-span-1',
  },
  {
    title: 'Adventure Parts',
    subtitle: 'Upgrade your ride',
    path: '/shop?category=Parts',
    image: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=900&h=380&fit=crop',
    span: 'md:col-span-2',
  },
];

export default function TrendingSection() {
  return (
    /* ── Trending / Editorial Cards ── */
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Editorial</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl">Trending Now</h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            Browse All <ArrowRight size={15} />
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-auto md:grid-rows-2 gap-4 auto-rows-fr">
          {editorials.map(ed => (
            <Link
              key={ed.title}
              to={ed.path}
              className={`group relative overflow-hidden ${ed.span} ${
                ed.span.includes('row-span-2') ? 'h-64 md:h-auto md:min-h-[420px]' : 'h-48 md:h-[200px]'
              }`}
            >
              <img
                src={ed.image}
                alt={ed.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <p className="text-white/70 text-[11px] uppercase tracking-widest mb-1">{ed.subtitle}</p>
                <h3 className="font-display font-bold text-lg md:text-xl text-white leading-tight">
                  {ed.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  Shop Now <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'New Arrivals',
    description: 'Fresh drops — the latest helmets, gear & accessories just landed.',
    cta: 'Shop New',
    path: '/shop',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop',
    badge: 'NEW',
  },
  {
    title: 'Top Deals',
    description: 'Up to 40% off on select riding gear. Limited stock — grab yours today.',
    cta: 'View Deals',
    path: '/shop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f7e7?w=800&h=600&fit=crop',
    badge: 'SALE',
  },
  {
    title: 'Seasonal Gear',
    description: 'All-weather riding essentials. From winter warmers to summer ventilation.',
    cta: 'Explore',
    path: '/shop?category=Winter+Gear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
    badge: null,
  },
];

export default function FeaturedCollections() {
  return (
    /* ── Featured Collections ── */
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Curated for You</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl">Featured Collections</h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {collections.map(col => (
            <Link
              key={col.title}
              to={col.path}
              className="group relative overflow-hidden block aspect-[4/3]"
            >
              {/* Background image */}
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

              {/* Badge */}
              {col.badge && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 tracking-widest">
                  {col.badge}
                </span>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display font-bold text-xl text-white mb-1.5">{col.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed mb-4 line-clamp-2">{col.description}</p>
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 group-hover:bg-accent transition-colors">
                  {col.cta} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

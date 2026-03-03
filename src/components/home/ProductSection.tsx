import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '@/data/mockData';
import ProductCard from '@/components/product/ProductCard';

interface ProductSectionProps {
  title: string;
  products: Product[];
  loading?: boolean;
  viewAllPath?: string;
  onQuickView?: (product: Product) => void;
}

function SectionSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="min-w-[220px] max-w-[260px] flex-shrink-0 bg-card border border-border">
          <div className="aspect-square bg-muted animate-pulse" />
          <div className="p-4 space-y-2.5">
            <div className="h-2.5 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-2.5 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductSection({ title, products, loading = false, viewAllPath = '/shop', onQuickView }: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="hidden md:flex p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors" aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="hidden md:flex p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors" aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
            <Link to={viewAllPath} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors ml-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-container pb-2 md:pb-0"
          >
            {products.map(product => (
              <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


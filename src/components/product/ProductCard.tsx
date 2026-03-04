import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  compact?: boolean;
}

export default function ProductCard({ product, onQuickView, compact = false }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className={`group bg-card border border-border shadow-card card-hover w-full ${compact ? '' : 'min-w-[260px] max-w-[320px] flex-shrink-0'}`}>
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover product-image-zoom"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            product.badge === 'new' ? 'badge-new' :
            product.badge === 'bestseller' ? 'badge-bestseller' :
            'badge-discount'
          }`}>
            {product.badge === 'discount' ? `-${product.discount}%` : product.badge === 'new' ? 'New' : 'Best Seller'}
          </span>
        )}

        {/* Quick view */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          className="absolute bottom-3 right-3 p-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Quick view"
        >
          <Eye size={16} />
        </button>
      </Link>

      {/* Info */}
      <div className={`${compact ? 'p-2.5 space-y-1.5' : 'p-4 space-y-2.5'}`}>
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={compact ? 10 : 12} className={i < Math.floor(product.rating) ? 'fill-warning text-warning' : 'text-border'} />
            ))}
          </div>
          <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-muted-foreground`}>({product.reviewCount})</span>
        </div>

        {/* Name */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors`}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display font-bold ${compact ? 'text-sm' : 'text-lg'} text-foreground`}>₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground line-through`}>₹{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Colors */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1">
            {product.colors.map(c => (
              <button
                key={c.name}
                onClick={(e) => { e.preventDefault(); setSelectedColor(c.name); }}
                className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} border-2 transition-all ${
                  selectedColor === c.name ? 'border-primary scale-110' : 'border-border'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        )}

        {/* Size */}
        {product.sizes.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {product.sizes.slice(0, compact ? 3 : 4).map(s => (
              <button
                key={s}
                onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
                className={`${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'} font-medium border transition-colors ${
                  selectedSize === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground ${compact ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'} font-semibold hover:bg-accent transition-colors btn-press mt-1`}
        >
          <ShoppingCart size={compact ? 12 : 14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className="relative bg-background border border-border shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 hover:text-primary transition-colors" aria-label="Close">
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-square bg-surface">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-center space-y-4">
            {product.badge && (
              <span className={`self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                product.badge === 'new' ? 'badge-new' : product.badge === 'bestseller' ? 'badge-bestseller' : 'badge-discount'
              }`}>
                {product.badge === 'discount' ? `-${product.discount}%` : product.badge === 'new' ? 'New' : 'Best Seller'}
              </span>
            )}

            <h2 className="font-display font-bold text-xl text-foreground">{product.name}</h2>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-warning text-warning' : 'text-border'} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-2xl">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Size */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Size</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedSize === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            {product.colors.length > 1 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Color: {selectedColor}</span>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 border-2 transition-all ${selectedColor === c.name ? 'border-primary scale-110' : 'border-border'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Qty</span>
              <div className="flex items-center border border-border">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-muted transition-colors"><Minus size={14} /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-muted transition-colors"><Plus size={14} /></button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press">
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <Link to={`/product/${product.id}`} onClick={onClose} className="px-5 py-3 border border-border text-sm font-medium hover:border-foreground transition-colors text-center">
                Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

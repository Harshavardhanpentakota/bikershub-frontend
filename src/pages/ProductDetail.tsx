import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, Truck, Shield, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductSection from '@/components/home/ProductSection';
import { products } from '@/data/mockData';
import type { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { productsApi, reviewsApi, ApiProduct, ApiReview } from '@/lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [apiReviews, setApiReviews] = useState<ApiReview[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    Promise.all([
      productsApi.getById(id),
      reviewsApi.forProduct(id).catch(() => [] as ApiReview[]),
    ]).then(([p, rev]) => {
      // Map ApiProduct → local Product shape
      const mapped: Product = {
        id: p._id,
        _id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand ?? '',
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.images?.[0] ?? '',
        images: p.images ?? [],
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        description: p.description ?? '',
        sizes: p.sizes ?? [],
        colors: p.colors ?? [],
        compatibleBikes: p.compatibleBikes ?? [],
        specifications: p.specifications ?? {},
        inStock: p.inStock ?? true,
        badge: p.badge,
        isNew: p.badge === 'new',
        discount: p.discount ?? 0,
      } as unknown as Product;
      setProduct(mapped);
      setApiReviews(Array.isArray(rev) ? rev : []);
    }).catch(() => {
      setProduct(null);
    }).finally(() => setLoadingProduct(false));
  }, [id]);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [mainImage, setMainImage] = useState(0);

  // Update selected size/color when product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] ?? '');
      setSelectedColor(product.colors[0]?.name ?? '');
    }
  }, [product]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="font-display text-2xl font-bold">Product Not Found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:text-accent">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = product.images || [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart`);
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-primary">{product.category}</Link>
            <ChevronRight size={12} />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-3">
              <div className="aspect-square bg-surface border border-border overflow-hidden">
                <img src={allImages[mainImage]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(i)}
                      className={`w-20 h-20 border-2 overflow-hidden transition-colors ${mainImage === i ? 'border-primary' : 'border-border'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              {product.badge && (
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  product.badge === 'new' ? 'badge-new' : product.badge === 'bestseller' ? 'badge-bestseller' : 'badge-discount'
                }`}>
                  {product.badge === 'discount' ? `-${product.discount}% OFF` : product.badge === 'new' ? 'New' : 'Best Seller'}
                </span>
              )}

              <h1 className="font-display font-bold text-2xl lg:text-3xl text-foreground">{product.name}</h1>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-warning text-warning' : 'text-border'} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-display font-bold text-3xl">₹{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-success">Save ₹{(product.originalPrice - product.price).toFixed(2)}</span>
                  </>
                )}
              </div>

              {/* Size */}
              <div>
                <span className="text-sm font-medium mb-2 block">Size: {selectedSize}</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-sm font-medium border transition-colors ${
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
                  <span className="text-sm font-medium mb-2 block">Color: {selectedColor}</span>
                  <div className="flex gap-2">
                    {product.colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-9 h-9 border-2 transition-all ${selectedColor === c.name ? 'border-primary scale-110' : 'border-border'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Actions */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 hover:bg-muted transition-colors"><Minus size={16} /></button>
                  <span className="w-12 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="p-3 hover:bg-muted transition-colors"><Plus size={16} /></button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-semibold hover:bg-accent transition-colors btn-press">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>

              <button className="w-full py-3 border-2 border-foreground text-foreground font-semibold text-sm hover:bg-foreground hover:text-background transition-colors btn-press">
                Buy Now
              </button>

              {/* Info */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Truck size={18} className="text-muted-foreground" />
                  <span>Free delivery on orders above ₹999. Estimated 3-5 business days.</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={18} className="text-muted-foreground" />
                  <span>1-year manufacturer warranty included.</span>
                </div>
              </div>

              {/* Compatible bikes */}
              {product.compatibleBikes.length > 0 && !product.compatibleBikes.includes('All') && (
                <div className="pt-4 border-t border-border">
                  <span className="text-sm font-medium mb-2 block">Compatible Bikes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.compatibleBikes.map(b => (
                      <span key={b} className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground">{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="flex border-b border-border">
              {(['description', 'specs', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'specs' ? 'Specifications' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{product.description}</p>
              )}
              {activeTab === 'specs' && (
                <div className="max-w-lg">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2.5 border-b border-border text-sm">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-6 max-w-2xl">
                  {apiReviews.slice(0, 5).map(r => (
                    <div key={r._id} className="border-b border-border pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'fill-warning text-warning' : 'text-border'} />
                          ))}
                        </div>
                        <span className="text-xs font-medium">{r.user?.name ?? 'Anonymous'}</span>
                        {r.verified && <span className="text-[10px] text-success font-medium">✓ Verified</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                      <span className="text-[11px] text-placeholder mt-1 block">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                  {apiReviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <ProductSection title="Related Products" products={relatedProducts} />
        )}
      </main>
      <Footer />
    </div>
  );
}

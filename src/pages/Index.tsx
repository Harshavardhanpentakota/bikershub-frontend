import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryStrip from '@/components/home/CategoryStrip';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductSection from '@/components/home/ProductSection';
import PromoBanner from '@/components/home/PromoBanner';
import TrendingSection from '@/components/home/TrendingSection';
import ShopByRide from '@/components/home/ShopByRide';
import Newsletter from '@/components/home/Newsletter';
import QuickViewModal from '@/components/product/QuickViewModal';
import { Product } from '@/data/mockData';
import { productsApi } from '@/lib/api';

// Map API product shape to local Product shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Product {
  return {
    id: p._id,
    _id: p._id,
    name: p.name,
    category: p.category,
    brand: p.brand ?? '',
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.images?.[0] ?? p.image ?? '',
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
}

export default function Index() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [deepDiscounts, setDeepDiscounts] = useState<Product[]>([]);
  const [loadingBS, setLoadingBS] = useState(true);
  const [loadingNA, setLoadingNA] = useState(true);
  const [loadingDD, setLoadingDD] = useState(true);

  useEffect(() => {
    productsApi.list({ badge: 'bestseller', limit: '8' })
      .then(d => setBestSellers(d.products.map(mapProduct)))
      .catch(() => {})
      .finally(() => setLoadingBS(false));

    productsApi.list({ isNew: 'true', limit: '8' })
      .then(d => setNewArrivals(d.products.map(mapProduct)))
      .catch(() => {})
      .finally(() => setLoadingNA(false));

    productsApi.list({ badge: 'discount', sort: '-discount', limit: '8' })
      .then(d => setDeepDiscounts(d.products.map(mapProduct)))
      .catch(() => {})
      .finally(() => setLoadingDD(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Promo Strip ── */}
      <div className="bg-primary text-primary-foreground text-center text-[11px] font-semibold py-2 tracking-wider z-50 relative">
        🏍️&nbsp; FREE SHIPPING on orders above ₹999 &nbsp;|&nbsp; Use code <strong>RIDER10</strong> for 10% off your first order &nbsp;🏍️
      </div>

      <Header />

      <main className="flex-1 pt-16">
        {/* 1 ─ Hero */}
        <HeroBanner />

        {/* 2 ─ Category Icon Strip */}
        <CategoryStrip />

        {/* 3 ─ Featured Collections */}
        <FeaturedCollections />

        {/* 4 ─ Popular Products */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 mb-2">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Riders' Favourites</p>
          </div>
          <ProductSection
            title="Best Sellers"
            products={bestSellers}
            loading={loadingBS}
            onQuickView={setQuickViewProduct}
            viewAllPath="/shop?badge=bestseller"
          />
        </section>

        {/* 5 ─ Trust Bar + Promo Banner */}
        <PromoBanner />

        {/* 6 ─ New Arrivals */}
        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 mb-2">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Just Landed</p>
          </div>
          <ProductSection
            title="New Arrivals"
            products={newArrivals}
            loading={loadingNA}
            onQuickView={setQuickViewProduct}
            viewAllPath="/shop?isNew=true"
          />
        </section>

        {/* 7 ─ Trending Editorial Cards */}
        <TrendingSection />

        {/* 8 ─ Deep Discounts */}
        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 mb-2">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Limited Time</p>
          </div>
          <ProductSection
            title="Deep Discounts"
            products={deepDiscounts}
            loading={loadingDD}
            onQuickView={setQuickViewProduct}
            viewAllPath="/shop?badge=discount"
          />
        </section>

        {/* 9 ─ Shop By Ride */}
        <ShopByRide />

        {/* 10 ─ Newsletter */}
        <Newsletter />
      </main>

      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}



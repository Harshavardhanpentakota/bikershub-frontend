import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { categories, Product } from '@/data/mockData';
import { productsApi, bikesApi } from '@/lib/api';
import { Search, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

// --------------- FilterSection helper ---------------
function FilterSection({
  title, expanded, onToggle, children,
}: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-3 text-left">
        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{title}</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {expanded && <div className="pb-3">{children}</div>}
    </div>
  );
}

// --------------- Skeleton grid ---------------
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-card border border-border">
          <div className="aspect-square bg-muted animate-pulse" />
          <div className="p-2.5 space-y-2">
            <div className="h-2.5 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-2.5 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------- Pagination ---------------
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  const visible = nums.filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="p-2 border border-border hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      {visible.map((n, i) => {
        const prev = visible[i - 1];
        return (
          <>
            {prev && n - prev > 1 && <span key={`ellipsis-${n}`} className="px-1 text-muted-foreground text-sm">…</span>}
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-8 h-8 text-xs font-medium border transition-colors ${
                n === page ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground'
              }`}
            >
              {n}
            </button>
          </>
        );
      })}
      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className="p-2 border border-border hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// --------------- Helper: map API product ---------------
function mapApiProduct(p: Parameters<typeof productsApi.list> extends [infer _P] ? never : never): Product;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiProduct(p: any): Product {
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
    colors: p.colors?.map((c: { name: string; hex: string }) => ({ name: c.name, hex: c.hex })) ?? [],
    compatibleBikes: p.compatibleBikes ?? [],
    specifications: p.specifications ?? {},
    inStock: p.inStock ?? true,
    badge: p.badge,
    isNew: p.badge === 'new',
    discount: p.discount ?? 0,
  } as unknown as Product;
}

// --------------- Main page ---------------
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [selectedBrand, setSelectedBrand] = useState(() => searchParams.get('brand') ?? '');
  const [selectedModel, setSelectedModel] = useState(() => searchParams.get('model') ?? '');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [page, setPage] = useState(() => Number(searchParams.get('page') ?? '1'));
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const LIMIT = 16;

  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [apiBrands, setApiBrands] = useState<Record<string, string[]>>({});

  // Debounce search input → search state
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch brands/models from backend once
  useEffect(() => {
    bikesApi.getBrands().then(d => setApiBrands(d.brands)).catch(() => {});
  }, []);

  // Sync URL with state
  useEffect(() => {
    const params: Record<string, string> = { page: String(page) };
    if (selectedCategories[0]) params.category = selectedCategories[0];
    if (selectedBrand) params.brand = selectedBrand;
    if (selectedModel) params.model = selectedModel;
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedBrand, selectedModel, page, search]);

  // Fetch products from backend
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
    if (selectedCategories[0]) params.category = selectedCategories[0];
    if (selectedBrand && selectedModel) {
      params.compatibleBike = `${selectedBrand} ${selectedModel}`;
    } else if (selectedBrand) {
      params.brand = selectedBrand;
    }
    if (search) params.search = search;
    productsApi.list(params)
      .then(data => {
        setApiProducts(data.products.map(mapApiProduct));
        setTotalProducts(data.total);
        setTotalPages(data.pages);
        setFetchError('');
      })
      .catch(err => setFetchError(err?.message ?? 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [selectedCategories, selectedBrand, selectedModel, page, search]);

  // Client-side color/size filter (API doesn't support these)
  const filteredProducts = useMemo(() => {
    let result = apiProducts;
    if (selectedColors.length > 0) result = result.filter(p => p.colors.some(c => selectedColors.includes(c.name)));
    if (selectedSizes.length > 0) result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    return result;
  }, [apiProducts, selectedColors, selectedSizes]);

  // Derive unique colours/sizes from loaded products
  const allColors = useMemo(() =>
    Array.from(new Map(apiProducts.flatMap(p => p.colors).map(c => [c.name, c])).values()),
    [apiProducts]);
  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = useMemo(() =>
    Array.from(new Set(apiProducts.flatMap(p => p.sizes).filter(s => !s.includes('/') && s !== 'Universal')))
    .sort((a, b) => {
      const numeric = (v: string) => !isNaN(Number(v));
      if (numeric(a) && numeric(b)) return Number(a) - Number(b);
      return commonSizes.indexOf(a) - commonSizes.indexOf(b);
    }), [apiProducts]);

  const [expanded, setExpanded] = useState({ category: true, brand: true, model: true, color: true, size: true });
  const toggle = (key: keyof typeof expanded) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const brandList  = Object.keys(apiBrands);
  const brandModels = selectedBrand ? apiBrands[selectedBrand] ?? [] : [];

  const hasFilters = selectedCategories.length > 0 || !!selectedBrand || selectedColors.length > 0 || selectedSizes.length > 0 || !!search;
  const clearAll = () => {
    setSelectedCategories([]); setSelectedBrand(''); setSelectedModel('');
    setSelectedColors([]); setSelectedSizes([]); setSearchInput(''); setSearch(''); setPage(1);
  };
  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) =>
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

  const goPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Page heading */}
          <div className="mb-4">
            <h1 className="font-display font-bold text-2xl lg:text-3xl">Shop</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? 'Loading…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`}
              {(selectedCategories[0] || selectedBrand || search) && !loading && (
                <span className="ml-2 text-primary font-medium">
                  {[search, selectedCategories[0], selectedModel ? `${selectedBrand} ${selectedModel}` : selectedBrand].filter(Boolean).join(' · ')}
                </span>
              )}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border border-border bg-card text-sm focus:outline-none focus:border-primary transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-5 items-start">
            {/* ── LEFT: Filter sidebar ── */}
            <aside className="w-56 flex-shrink-0 sticky top-24">
              <div className="bg-card border border-border px-4 pt-3 pb-1">
                <div className="flex items-center justify-between mb-1 pb-2 border-b border-border">
                  <span className="font-bold text-xs uppercase tracking-widest">Filters</span>
                  {hasFilters && (
                    <button onClick={clearAll} className="text-[11px] text-primary hover:underline">Clear all</button>
                  )}
                </div>

                {/* Category */}
                <FilterSection title="Category" expanded={expanded.category} onToggle={() => toggle('category')}>
                  <div className="space-y-1.5">
                    {categories.map(cat => (
                      <label key={cat.name} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => { toggleSet(setSelectedCategories, cat.name); setPage(1); }}
                          className="w-3.5 h-3.5 accent-primary rounded-none"
                        />
                        <span className="text-[12px] text-foreground group-hover:text-primary transition-colors leading-none">
                          {cat.icon} {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Brand */}
                <FilterSection title="Brand" expanded={expanded.brand} onToggle={() => toggle('brand')}>
                  <div className="space-y-1.5">
                    {brandList.map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio" name="brand"
                          checked={selectedBrand === brand}
                          onChange={() => { setSelectedBrand(brand); setSelectedModel(''); setPage(1); }}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <span className="text-[12px] text-foreground group-hover:text-primary transition-colors">{brand}</span>
                      </label>
                    ))}
                    {selectedBrand && (
                      <button onClick={() => { setSelectedBrand(''); setSelectedModel(''); setPage(1); }} className="text-[11px] text-muted-foreground hover:text-primary mt-0.5">
                        ✕ Clear brand
                      </button>
                    )}
                  </div>
                </FilterSection>

                {/* Model — dynamic */}
                {selectedBrand && brandModels.length > 0 && (
                  <FilterSection title="Model" expanded={expanded.model} onToggle={() => toggle('model')}>
                    <div className="space-y-1.5">
                      {brandModels.map(model => (
                        <label key={model} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio" name="model"
                            checked={selectedModel === model}
                            onChange={() => { setSelectedModel(model); setPage(1); }}
                            className="w-3.5 h-3.5 accent-primary"
                          />
                          <span className="text-[12px] text-foreground group-hover:text-primary transition-colors">{model}</span>
                        </label>
                      ))}
                      {selectedModel && (
                        <button onClick={() => { setSelectedModel(''); setPage(1); }} className="text-[11px] text-muted-foreground hover:text-primary mt-0.5">
                          ✕ Clear model
                        </button>
                      )}
                    </div>
                  </FilterSection>
                )}

                {/* Color */}
                <FilterSection title="Color" expanded={expanded.color} onToggle={() => toggle('color')}>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map(({ name, hex }) => (
                      <button
                        key={name} title={name}
                        onClick={() => toggleSet(setSelectedColors, name)}
                        className={`w-6 h-6 border-2 transition-all ${
                          selectedColors.includes(name)
                            ? 'border-primary ring-1 ring-primary ring-offset-1 scale-110'
                            : 'border-border hover:border-foreground'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  {selectedColors.length > 0 && <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{selectedColors.join(', ')}</p>}
                </FilterSection>

                {/* Size */}
                <FilterSection title="Size" expanded={expanded.size} onToggle={() => toggle('size')}>
                  <div className="flex flex-wrap gap-1">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSet(setSelectedSizes, size)}
                        className={`px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </aside>

            {/* ── RIGHT: Product grid ── */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <ProductGridSkeleton />
              ) : fetchError ? (
                <div className="text-center py-24">
                  <p className="text-destructive text-sm">{fetchError}</p>
                  <button onClick={clearAll} className="mt-3 text-xs text-primary hover:underline">Retry</button>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} compact />
                    ))}
                  </div>
                  <Pagination page={page} pages={totalPages} onChange={goPage} />
                </>
              ) : (
                <div className="text-center py-24">
                  <p className="text-muted-foreground text-sm">No products found for this selection.</p>
                  <button onClick={clearAll} className="mt-3 text-xs text-primary hover:underline">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}

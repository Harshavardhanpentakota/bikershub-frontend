import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikesApi } from '@/lib/api';
import { ChevronDown, Search } from 'lucide-react';

const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const types  = ['Street', 'Adventure', 'Sport', 'Cruiser', 'Scooter', 'Naked'];

export default function ShopByRide() {
  const [type,  setType]  = useState('');
  const [year,  setYear]  = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [apiBrands, setApiBrands] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    bikesApi.getBrands()
      .then(d => setApiBrands(d.brands))
      .catch(() => {}); // silently fall back to empty
  }, []);

  const brandList = Object.keys(apiBrands);
  const models = brand ? apiBrands[brand] ?? [] : [];

  const handleGo = () => {
    if (brand && model) {
      navigate(`/shop?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`);
    } else if (brand) {
      navigate(`/shop?brand=${encodeURIComponent(brand)}`);
    } else {
      navigate('/shop');
    }
  };

  const selectCls =
    'flex-1 min-w-[120px] appearance-none bg-white border border-border px-3 py-2.5 pr-8 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer';

  return (
    /* ── Shop Your Ride ── */
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Find the Perfect Fit</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">Shop Your Ride</h2>
          <p className="text-sm text-muted-foreground mb-7">
            Select your bike to browse compatible parts, accessories &amp; gear.
          </p>

          <div className="flex flex-wrap gap-3 items-stretch justify-center">
            {/* Type */}
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
                <option value="">Type</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>

            {/* Year */}
            <div className="relative">
              <select value={year} onChange={e => setYear(e.target.value)} className={selectCls}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>

            {/* Make / Brand */}
            <div className="relative">
              <select
                value={brand}
                onChange={e => { setBrand(e.target.value); setModel(''); }}
                className={selectCls}
              >
                <option value="">Make</option>
                {brandList.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>

            {/* Model */}
            <div className="relative">
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                disabled={!brand}
                className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <option value="">Model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>

            {/* Go button */}
            <button
              onClick={handleGo}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-accent transition-colors btn-press"
            >
              <Search size={15} />
              Go
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

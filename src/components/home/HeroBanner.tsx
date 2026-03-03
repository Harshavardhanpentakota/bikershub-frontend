import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroBanner1 from '@/assets/hero-banner-1.jpg';
import heroBanner2 from '@/assets/hero-banner-2.jpg';

const slides = [
  {
    image: heroBanner1,
    badge: '2026 RELEASES',
    title: 'Gear Up.\nRide Bold.',
    description: 'Premium helmets, riding gear & accessories engineered for performance and protection.',
    cta1: { label: 'Shop Now', path: '/shop' },
    cta2: { label: 'Explore Helmets', path: '/shop?category=Helmets' },
    align: 'left' as const,
  },
  {
    image: heroBanner2,
    badge: 'SAFETY FIRST',
    title: 'Helmets That\nDefine You',
    description: "DOT & ECE 22.06 certified helmets from the world's top brands — starting at ₹3,999.",
    cta1: { label: 'Browse Helmets', path: '/shop?category=Helmets' },
    cta2: { label: 'View All Gear', path: '/shop' },
    align: 'center' as const,
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
      setAnimKey(k => k + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i: number) => {
    setCurrent(i);
    setAnimKey(k => k + 1);
  };

  const slide = slides[current];

  return (
    /* ── Hero Banner ── */
    <section className="relative w-full h-[92vh] min-h-[560px] max-h-[860px] overflow-hidden bg-foreground">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.55)' }}
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />

      {/* Content */}
      <div
        className={`relative z-10 container mx-auto px-4 h-full flex items-center ${
          slide.align === 'center' ? 'justify-center' : 'justify-start'
        }`}
      >
        <div
          key={animKey}
          className={`max-w-2xl ${
            slide.align === 'center' ? 'text-center' : 'text-left'
          }`}
          style={{ animation: 'heroFadeUp 0.7s ease both' }}
        >
          {/* Badge */}
          <span className="inline-block bg-primary text-primary-foreground text-[11px] font-black tracking-[0.25em] px-3 py-1.5 mb-5 uppercase">
            {slide.badge}
          </span>

          {/* Heading */}
          <h1
            className="font-display font-black text-white leading-[1.02] whitespace-pre-line"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}
          >
            {slide.title}
          </h1>

          {/* Description */}
          <p className="mt-5 text-white/65 text-base md:text-lg max-w-lg leading-relaxed">
            {slide.description}
          </p>

          {/* CTAs */}
          <div className={`mt-8 flex flex-wrap gap-3 ${slide.align === 'center' ? 'justify-center' : ''}`}>
            <Link
              to={slide.cta1.path}
              className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold hover:bg-accent transition-colors btn-press tracking-wide"
            >
              {slide.cta1.label}
            </Link>
            <Link
              to={slide.cta2.path}
              className="border-2 border-white/40 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/10 hover:border-white/70 transition-colors btn-press tracking-wide"
            >
              {slide.cta2.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Dot + arrow controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2.5 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-400 ${
                i === current
                  ? 'w-8 h-1.5 bg-primary'
                  : 'w-3 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-6 z-10 text-white/40 text-xs font-mono tracking-widest select-none">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  );
}

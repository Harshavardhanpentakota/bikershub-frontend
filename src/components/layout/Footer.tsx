import { Link } from 'react-router-dom';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';
import logo from '../../assets/Bikershublogo.png';

const columns: Record<string, { label: string; path: string }[]> = {
  Shop: [
    { label: 'Helmets',      path: '/shop?category=Helmets' },
    { label: 'Riding Gears', path: '/shop?category=Riding+Gears' },
    { label: 'Parts',        path: '/shop?category=Parts' },
    { label: 'Accessories',  path: '/shop?category=Accessories' },
    { label: 'Tires',        path: '/shop?category=Tires' },
    { label: 'Sale',         path: '/shop' },
  ],
  'Customer Service': [
    { label: 'Contact Us',    path: '#' },
    { label: 'FAQs',          path: '#' },
    { label: 'Shipping Info', path: '#' },
    { label: 'Returns',       path: '#' },
    { label: 'Size Guide',    path: '#' },
    { label: 'Track Order',   path: '#' },
  ],
  Resources: [
    { label: "Rider's Blog", path: '#' },
    { label: 'Buying Guides', path: '#' },
    { label: 'Gear Reviews',  path: '#' },
    { label: 'Affiliate',     path: '#' },
    { label: 'Press',         path: '#' },
    { label: 'Careers',       path: '#' },
  ],
};

const socials = [
  { icon: <Instagram size={17} />, label: 'Instagram', href: '#' },
  { icon: <Youtube   size={17} />, label: 'YouTube',   href: '#' },
  { icon: <Twitter   size={17} />, label: 'Twitter',   href: '#' },
  { icon: <Facebook  size={17} />, label: 'Facebook',  href: '#' },
];

const paymentBadges = ['Visa', 'Mastercard', 'UPI', 'Razorpay', 'COD'];

export default function Footer() {
  return (
    /* ── Footer ── */
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="BikersHub" className="h-14 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-background/55 leading-relaxed max-w-xs mb-6">
              India’s premier destination for premium motorcycle gear, parts &amp; accessories. Ride safe. Ride smart.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center border border-background/15 text-background/50 hover:border-primary hover:text-primary transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-[11px] uppercase tracking-[0.18em] text-background/90 mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      to={l.path}
                      className="text-sm text-background/45 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {paymentBadges.map(b => (
              <span
                key={b}
                className="px-2.5 py-1 border border-background/15 text-background/35 text-[10px] font-semibold tracking-wider"
              >
                {b}
              </span>
            ))}
          </div>
          <p className="text-xs text-background/30 text-center">© 2026 BikersHub. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-background/35">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

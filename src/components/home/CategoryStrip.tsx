import { Link } from 'react-router-dom';

const cats = [
  { icon: '🪖', label: 'Helmets',      path: '/shop?category=Helmets',      bg: 'bg-orange-50' },
  { icon: '🧥', label: 'Riding Gear',  path: '/shop?category=Riding+Gears', bg: 'bg-slate-50'  },
  { icon: '⚙️', label: 'Parts',        path: '/shop?category=Parts',        bg: 'bg-zinc-50'   },
  { icon: '💡', label: 'Accessories',  path: '/shop?category=Accessories',  bg: 'bg-amber-50'  },
  { icon: '🛞', label: 'Tires',        path: '/shop?category=Tires',        bg: 'bg-stone-50'  },
  { icon: '🛡️', label: 'Protection',   path: '/shop?category=Airbags',      bg: 'bg-red-50'    },
  { icon: '❄️', label: 'Winter Gear',  path: '/shop?category=Winter+Gear',  bg: 'bg-sky-50'    },
  { icon: '🔧', label: 'Tools',        path: '/shop?category=Parts',        bg: 'bg-gray-50'   },
  { icon: '📚', label: 'Learn to Ride',path: '/shop?category=Learn+To+Ride',bg: 'bg-lime-50'   },
  { icon: '🏍️', label: 'New Riders',   path: '/shop?category=New+Riders',   bg: 'bg-violet-50' },
];

export default function CategoryStrip() {
  return (
    /* ── Category Icon Strip ── */
    <section className="bg-background border-b border-border py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-display font-bold text-xl md:text-2xl mb-6 tracking-tight">
          Shop by Category
        </h2>

        <div className="flex gap-4 overflow-x-auto scroll-container pb-2 justify-start md:justify-center">
          {cats.map(({ icon, label, path, bg }) => (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${bg} border-2 border-border flex items-center justify-center text-2xl md:text-3xl
                  group-hover:border-primary group-hover:scale-105 transition-all duration-200 shadow-sm`}
              >
                {icon}
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-center text-foreground/80 group-hover:text-primary transition-colors leading-tight max-w-[72px]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

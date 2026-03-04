import { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing! Welcome to the BikersHub community.');
      setEmail('');
    }
  };

  return (
    /* ── Newsletter Section ── */
    <section className="relative overflow-hidden bg-foreground py-16">
      {/* Decorative rings */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-primary/10 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-primary/10 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-5">
            <Mail size={22} className="text-primary" />
          </span>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white leading-tight">
            Stay in the Fast Lane
          </h2>
          <p className="mt-3 text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Get exclusive deals, 2026 new arrivals, and expert riding tips delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/8 text-black border border-white/15 px-4 py-3 text-sm placeholder:text-white/30 outline-none focus:border-primary transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 font-bold text-sm hover:bg-accent transition-colors btn-press flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Send size={15} />
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-white/25 text-[11px]">No spam. Unsubscribe with one click.</p>
        </div>
      </div>
    </section>
  );
}

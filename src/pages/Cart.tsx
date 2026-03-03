import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [coupon, setCoupon] = useState('');
  const shipping = totalPrice > 999 ? 0 : 79;
  const total = totalPrice + shipping;

  const applyCoupon = () => {
    if (coupon) {
      toast.info('Invalid coupon code');
      setCoupon('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press">
            Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
            <h1 className="font-display font-bold text-2xl">Shopping Cart ({items.length})</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4 p-4 border border-border bg-card animate-fade-in-up">
                  <Link to={`/product/${item.product.id}`} className="w-24 h-24 flex-shrink-0 bg-surface overflow-hidden">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <Link to={`/product/${item.product.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.selectedSize} · {item.selectedColor}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors"><Plus size={14} /></button>
                      </div>
                      <span className="font-display font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border border-border bg-card p-6 h-fit space-y-4">
              <h2 className="font-display font-bold text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              </div>

              {/* Coupon */}
              <div className="flex gap-0 pt-2">
                <div className="flex-1 flex items-center border border-border px-3 gap-2">
                  <Tag size={14} className="text-muted-foreground" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent text-sm py-2 outline-none placeholder:text-placeholder"
                  />
                </div>
                <button onClick={applyCoupon} className="bg-secondary text-secondary-foreground px-4 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  Apply
                </button>
              </div>

              <div className="border-t border-border pt-4 flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="block w-full bg-primary text-primary-foreground py-3 text-center font-semibold text-sm hover:bg-accent transition-colors btn-press">
                Proceed to Checkout
              </Link>
              <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

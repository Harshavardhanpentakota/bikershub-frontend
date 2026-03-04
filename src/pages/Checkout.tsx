import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { ordersApi, paymentApi, usersApi, ApiAddress } from '@/lib/api';

const steps = ['Address', 'Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const { items, totalPrice, clearCart } = useCart();
  // INR: free standard for orders > ₹999, express ₹149
  const expressShipping = 149;
  const standardShipping = totalPrice > 999 ? 0 : 79;
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' });
  const [savedAddresses, setSavedAddresses] = useState<ApiAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const shipping = shippingMethod === 'express' ? expressShipping : standardShipping;

  useEffect(() => {
    const token = localStorage.getItem('bh_token');
    if (!token) {
      setLoadingAddresses(false);
      return;
    }

    setLoadingAddresses(true);
    usersApi.getAddresses()
      .then(list => {
        setSavedAddresses(list ?? []);
        const defaultAddress = (list ?? []).find(a => a.isDefault);
        setSelectedSavedAddressId(defaultAddress?._id ?? list?.[0]?._id ?? '');
      })
      .catch(() => setSavedAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, []);

  const canNext = () => {
    if (currentStep === 0) {
      if (loadingAddresses) return false;
      if (savedAddresses.length > 0) return !!selectedSavedAddressId;
      return !!(address.name && address.street && address.city && address.state && address.zip && address.phone);
    }
    return true;
  };

  // Dynamically load Razorpay script
  const loadRazorpay = () =>
    new Promise<boolean>(resolve => {
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleNext = async () => {
    if (!canNext()) { toast.error('Please fill all required fields'); return; }
    if (currentStep < steps.length - 1) { setCurrentStep(s => s + 1); return; }

    // Final step — place order
    setPlacingOrder(true);
    try {
      const shippingAddress = {
        name: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.name ?? '')
          : address.name,
        street: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.street ?? '')
          : address.street,
        city: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.city ?? '')
          : address.city,
        state: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.state ?? '')
          : address.state,
        zip: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.zip ?? '')
          : address.zip,
        phone: savedAddresses.length > 0
          ? (savedAddresses.find(a => a._id === selectedSavedAddressId)?.phone ?? '')
          : address.phone,
        country: 'India',
      };
      const orderItems = items.map(i => ({
        product: (i.product as unknown as { _id?: string })._id ?? i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      }));

      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Razorpay SDK failed to load'); return; }

        // 1. Create the order in DB first
        const dbOrder = await ordersApi.place({ items: orderItems, shippingAddress, shippingMethod, paymentMethod });

        // 2. Create Razorpay payment order
        const rpOrder = await paymentApi.createOrder({ amount: totalPrice + shipping, orderId: dbOrder._id });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rpOrder.amount,
          currency: 'INR',
          name: 'BikersHub',
          description: 'Order Payment',
          order_id: rpOrder.razorpayOrderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await paymentApi.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: dbOrder._id,
              });
              clearCart();
              setOrderConfirmed(true);
              toast.success('Payment successful! Order confirmed.');
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: address.name, contact: address.phone },
          theme: { color: '#FF6A2B' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD / UPI — place order directly
        await ordersApi.place({ items: orderItems, shippingAddress, shippingMethod, paymentMethod });
        clearCart();
        setOrderConfirmed(true);
        toast.success('Order placed successfully!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Order failed. Try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <Check size={48} className="mx-auto text-success mb-4" />
          <h1 className="font-display text-2xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">Thank you for your purchase.</p>
          <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press">
            Continue Shopping
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
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/cart" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
            <h1 className="font-display font-bold text-2xl">Checkout</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-10">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold ${
                    i < currentStep ? 'bg-success text-success-foreground' :
                    i === currentStep ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStep ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i < currentStep ? 'bg-success' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="animate-fade-in-up">
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-lg">Shipping Address</h2>
                {loadingAddresses ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 w-full bg-muted" />
                    <div className="h-10 w-full bg-muted" />
                    <div className="h-10 w-full bg-muted" />
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Select a saved address for billing and shipping.</p>
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => setSelectedSavedAddressId(addr._id)}
                        className={`w-full text-left border p-4 transition-colors ${
                          selectedSavedAddressId === addr._id ? 'border-primary bg-secondary' : 'border-border hover:border-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{addr.name}</span>
                          {addr.isDefault && <span className="text-[10px] font-bold text-primary">DEFAULT</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No saved addresses found. Please fill your billing details manually.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1.5">Full Name *</label>
                        <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1.5">Street Address *</label>
                        <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5">City *</label>
                        <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5">State *</label>
                        <input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5">ZIP Code *</label>
                        <input value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5">Phone *</label>
                        <input value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-lg">Shipping Method</h2>
                {[
                  { id: 'standard', label: 'Standard Delivery', desc: '5-7 business days', price: totalPrice > 999 ? 'Free' : '₹79' },
                  { id: 'express', label: 'Express Delivery', desc: '2-3 business days', price: '₹149' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setShippingMethod(m.id)}
                    className={`w-full flex justify-between items-center p-4 border transition-colors text-left ${
                      shippingMethod === m.id ? 'border-primary bg-secondary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{m.desc}</span>
                    </div>
                    <span className="text-sm font-semibold">{m.price}</span>
                  </button>
                ))}
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-lg">Payment Method</h2>
                {[
                  { id: 'cod', label: 'Cash on Delivery' },
                  { id: 'razorpay', label: 'Pay Online (Razorpay — UPI / Card / NetBanking)' },
                  { id: 'upi', label: 'UPI Direct' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full p-4 border text-left text-sm font-medium transition-colors ${
                      paymentMethod === m.id ? 'border-primary bg-secondary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-display font-semibold text-lg">Order Review</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3 text-sm">
                      <div className="w-14 h-14 bg-surface flex-shrink-0 overflow-hidden">
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="block text-xs text-muted-foreground">Qty: {item.quantity} · {item.selectedSize} · {item.selectedColor}</span>
                      </div>
                      <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                  <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border"><span>Total</span><span>₹{(totalPrice + shipping).toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              className={`px-6 py-3 border border-border text-sm font-medium hover:border-foreground transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={placingOrder}
              className="bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press disabled:opacity-60"
            >
              {placingOrder ? 'Processing…' : currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

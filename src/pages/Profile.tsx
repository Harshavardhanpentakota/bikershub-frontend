import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, User, LogOut, ChevronRight, RotateCcw, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usersApi, ordersApi, ApiOrder, ApiAddress } from '@/lib/api';

type Tab = 'orders' | 'addresses' | 'account';

const statusColors: Record<string, string> = {
  processing: 'bg-warning/10 text-warning',
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Profile() {
  const [tab, setTab] = useState<Tab>('orders');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    setLoadingOrders(true);
    ordersApi.myList().then(orders => setOrders(orders)).catch(() => {}).finally(() => setLoadingOrders(false));

    setLoadingProfile(true);
    usersApi.me().then(u => {
      setProfileName(u.name);
      setProfilePhone(u.phone ?? '');
      setAddresses(u.addresses ?? []);
    }).catch(() => {}).finally(() => setLoadingProfile(false));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = [newAddress.name, newAddress.street, newAddress.city, newAddress.state, newAddress.zip, newAddress.phone];
    if (required.some(v => !v.trim())) {
      toast.error('Please fill all address fields');
      return;
    }

    setSavingAddress(true);
    try {
      const updated = await usersApi.addAddress({
        name: newAddress.name.trim(),
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        zip: newAddress.zip.trim(),
        phone: newAddress.phone.trim(),
        isDefault: newAddress.isDefault,
      });
      setAddresses(updated);
      setShowAddAddress(false);
      setNewAddress({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await usersApi.update({ name: profileName, phone: profilePhone });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'account' as Tab, label: 'Account Info', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-2xl mb-8">My Account</h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="flex lg:block gap-1 overflow-x-auto lg:overflow-visible">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                  <ChevronRight size={14} className="ml-auto" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {tab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Order History</h2>
                  {loadingOrders && (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-border p-4 space-y-3 animate-pulse">
                          <div className="h-4 w-36 bg-muted" />
                          <div className="h-3 w-24 bg-muted" />
                          <div className="h-10 w-full bg-muted" />
                        </div>
                      ))}
                    </div>
                  )}
                  {!loadingOrders && orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                  {!loadingOrders && orders.map(order => (
                    <div key={order._id} className="border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                          <span className="block text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] ?? ''}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-12 h-12 bg-surface overflow-hidden flex-shrink-0">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="flex-1 min-w-0 line-clamp-2">{item.name} × {item.quantity}</span>
                            <span className="font-medium flex-shrink-0">₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between pt-3 border-t border-border">
                        <span className="text-sm font-display font-bold">Total: ₹{order.total.toFixed(2)}</span>
                        <div className="flex flex-wrap gap-2">
                          {order.trackingId && (
                            <button onClick={() => toast.info(`Tracking: ${order.trackingId}`)} className="px-3 py-1.5 border border-border text-xs font-medium hover:border-foreground transition-colors">
                              Track Order
                            </button>
                          )}
                          <button onClick={() => toast.success('Items added to cart')} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                            <RotateCcw size={12} /> Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display font-semibold text-lg">Saved Addresses</h2>
                    <button
                      onClick={() => setShowAddAddress(v => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-semibold hover:border-foreground transition-colors"
                    >
                      <Plus size={13} /> {showAddAddress ? 'Cancel' : 'Add Address'}
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="border border-border p-4 space-y-3 bg-card">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input value={newAddress.name} onChange={e => setNewAddress(a => ({ ...a, name: e.target.value }))} placeholder="Full Name" className="border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <input value={newAddress.phone} onChange={e => setNewAddress(a => ({ ...a, phone: e.target.value }))} placeholder="Phone" className="border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <input value={newAddress.street} onChange={e => setNewAddress(a => ({ ...a, street: e.target.value }))} placeholder="Street Address" className="sm:col-span-2 border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <input value={newAddress.city} onChange={e => setNewAddress(a => ({ ...a, city: e.target.value }))} placeholder="City" className="border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <input value={newAddress.state} onChange={e => setNewAddress(a => ({ ...a, state: e.target.value }))} placeholder="State" className="border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <input value={newAddress.zip} onChange={e => setNewAddress(a => ({ ...a, zip: e.target.value }))} placeholder="ZIP Code" className="border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress(a => ({ ...a, isDefault: e.target.checked }))} className="accent-primary" />
                          Set as default
                        </label>
                      </div>
                      <button disabled={savingAddress} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-60">
                        {savingAddress ? 'Saving…' : 'Save Address'}
                      </button>
                    </form>
                  )}

                  {loadingProfile && (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-border p-4 space-y-2 animate-pulse">
                          <div className="h-4 w-40 bg-muted" />
                          <div className="h-3 w-full bg-muted" />
                          <div className="h-3 w-32 bg-muted" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingProfile && addresses.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses.</p>}
                  {!loadingProfile && addresses.map((addr, idx) => (
                    <div key={addr._id ?? idx} className="border border-border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-medium">{addr.name}</span>
                          {addr.isDefault && <span className="ml-2 text-[10px] font-bold text-primary">DEFAULT</span>}
                          <p className="text-sm text-muted-foreground mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                        </div>
                        <button className="text-xs text-primary hover:text-accent font-medium">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'account' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="font-display font-semibold text-lg">Account Information</h2>
                  {loadingProfile ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-10 w-full bg-muted" />
                      <div className="h-10 w-full bg-muted" />
                      <div className="h-10 w-full bg-muted" />
                      <div className="h-10 w-36 bg-muted" />
                    </div>
                  ) : (
                    <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Full Name</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Email</label>
                    <input value={user?.email ?? ''} readOnly className="w-full border border-border px-4 py-3 text-sm outline-none bg-muted text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Phone</label>
                    <input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background" />
                  </div>
                  <button onClick={handleSaveProfile} className="bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press">
                    Save Changes
                  </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

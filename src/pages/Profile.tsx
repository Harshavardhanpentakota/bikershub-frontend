import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, User, LogOut, ChevronRight, RotateCcw } from 'lucide-react';
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

  useEffect(() => {
    ordersApi.myList().then(orders => setOrders(orders)).catch(() => {});
    usersApi.me().then(u => {
      setProfileName(u.name);
      setProfilePhone(u.phone ?? '');
      setAddresses(u.addresses ?? []);
    }).catch(() => {});
  }, []);

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
            <div className="space-y-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
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
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
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
                  {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                  {orders.map(order => (
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
                            <span className="flex-1">{item.name} × {item.quantity}</span>
                            <span className="font-medium">₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm font-display font-bold">Total: ₹{order.total.toFixed(2)}</span>
                        <div className="flex gap-2">
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
                  <h2 className="font-display font-semibold text-lg">Saved Addresses</h2>
                  {addresses.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses.</p>}
                  {addresses.map((addr, idx) => (
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    const redirectTo = `${window.location.origin}/auth/google/callback`;
    window.location.href = authApi.getGoogleAuthUrl(redirectTo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16 flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join the BikersHub community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="John Rider"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Min. 8 characters"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full border border-border py-3 font-semibold text-sm hover:border-foreground transition-colors"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-accent">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

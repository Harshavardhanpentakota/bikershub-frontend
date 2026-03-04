import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const redirectTo = `${window.location.origin}/auth/google/callback`;
    window.location.href = authApi.getGoogleAuthUrl(redirectTo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/profile');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
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
            <h1 className="font-display font-bold text-2xl">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end">
              <Link to="#" className="text-xs text-primary hover:text-accent">Forgot password?</Link>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 font-semibold text-sm hover:bg-accent transition-colors btn-press disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
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
              onClick={handleGoogleLogin}
              className="w-full border border-border py-3 font-semibold text-sm hover:border-foreground transition-colors"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:text-accent">Create one</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

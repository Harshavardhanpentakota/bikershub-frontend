import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function getTokenFromParams(params: URLSearchParams) {
  return params.get('token') || params.get('access_token') || params.get('jwt') || '';
}

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { applyAuthPayload, loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const finishGoogleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = getTokenFromParams(params);
      const code = params.get('code') || '';
      const apiError = params.get('error') || '';

      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (apiError) {
        setError(apiError);
        toast.error(apiError);
        return;
      }

      try {
        if (token) {
          await loginWithToken(token);
          toast.success('Signed in with Google');
          navigate('/profile', { replace: true });
          return;
        }

        if (code) {
          const redirectTo = `${window.location.origin}/auth/google/callback`;
          const { token: tok, user } = await authApi.exchangeGoogleCode(code, redirectTo);
          applyAuthPayload(tok, user);
          toast.success('Signed in with Google');
          navigate('/profile', { replace: true });
          return;
        }

        throw new Error('Invalid Google login response');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Google login failed';
        setError(msg);
        toast.error(msg);
      }
    };

    finishGoogleAuth();
  }, [applyAuthPayload, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16 flex items-center justify-center">
        <div className="w-full max-w-sm mx-4 text-center">
          {!error ? (
            <>
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground mt-3">Completing Google sign in…</p>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl">Google Login Failed</h1>
              <p className="text-sm text-destructive mt-2">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-5 bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-accent transition-colors"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

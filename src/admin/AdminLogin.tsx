import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sparkles, Key, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(err.message || 'Authentication failed. Make sure your credentials are correct.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-cream-dark/50 rounded-xs p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* LOGO AND HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-border/10 text-rose border border-rose-border/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Salon Dashboard Login</span>
          </div>
          <h1 className="serif text-3xl font-light text-charcoal tracking-tight">
            The Brow Manor
          </h1>
          <p className="text-xs font-sans text-charcoal-light/65 tracking-wide uppercase">
            Leticia East — Administrator Portal
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">
              Gmail / Email Address
            </label>
            <input
              type="email"
              required
              placeholder="leticiaeast04@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/30 focus:border-sage focus:outline-hidden text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">
              Secure Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/30 focus:border-sage focus:outline-hidden text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose/5 border border-rose/10 text-rose rounded-xs text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-center py-2.5 text-xs font-sans font-bold uppercase tracking-widest rounded-xs bg-sage hover:bg-sage-dark text-cream border border-sage transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Key className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-charcoal-light/45">
            Manually created and registered via Firebase console.
          </p>
        </div>
      </div>
    </div>
  );
}

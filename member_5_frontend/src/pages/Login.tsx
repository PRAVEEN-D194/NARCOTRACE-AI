import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const Login: React.FC = () => {
  const [badgeNumber, setBadgeNumber] = useState('LE-8902');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(badgeNumber);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid Badge Authorization Number');
      }
    } catch (err) {
      setError('Authentication Service Unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 mb-2">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold font-mono tracking-wider text-slate-100">
            NARCO<span className="text-cyan-400">-TRACE</span> AI
          </h1>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Investigator Intelligence Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Investigator Badge ID</span>
              <span className="text-[10px] text-cyan-400">LE-8902</span>
            </label>
            <input
              type="text"
              required
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 text-slate-100 font-mono text-sm rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="e.g. LE-8902"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Authorization Key</span>
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 text-slate-100 font-mono text-sm rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full"
          >
            Authenticate Session
          </Button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-[11px] font-mono text-amber-400">
            RESTRICTED SYSTEM // AUTHORIZED LAW ENFORCEMENT ONLY
          </p>
          <p className="text-[10px] text-slate-500">
            Frontend Platform Integration Layer (Member 5)
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Radio, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const Login: React.FC = () => {
  const [badgeNumber, setBadgeNumber] = useState('LE-8902');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('Dark Net Cyber Crime Division');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Pre-filled bullet password mapping for hackathon demo convenience
    let submittedPassword = password;
    if (password === '••••••••••••') {
      if (badgeNumber === 'LE-8950') {
        submittedPassword = 'adminpassword';
      } else {
        submittedPassword = 'password123';
      }
    }

    try {
      await login(badgeNumber, submittedPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check badge credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070C16] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <div className="max-w-md w-full space-y-6">
        {/* Top Intelligence Badge Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shadow-sm">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              NARCO<span className="text-blue-600 dark:text-blue-400">-TRACE</span> AI
            </h1>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-1">
              Law Enforcement Investigator Portal
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center space-x-2.5 text-xs text-amber-800 dark:text-amber-400 font-mono">
            <Shield className="w-4 h-4 shrink-0" />
            <span>RESTRICTED LAW ENFORCEMENT SYSTEM</span>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl text-[11px] space-y-1 font-sans leading-normal">
            <span className="font-semibold text-blue-700 dark:text-blue-300 block">Authorized Demo Badges (Password: password123):</span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
              <li><strong className="font-mono text-blue-600 dark:text-blue-400">LE-8902</strong>: Agent J. Miller (Investigator role)</li>
              <li><strong className="font-mono text-blue-600 dark:text-blue-400">LE-8903</strong>: Superintendent Sharma (Senior Analyst role)</li>
              <li><strong className="font-mono text-blue-600 dark:text-blue-400">LE-8950</strong>: System Admin (Password: <span className="font-mono">adminpassword</span>)</li>
            </ul>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-400 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Investigator Badge ID</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  placeholder="e.g. LE-8902"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department / Division</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Authorization Key</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" type="submit" className="w-full py-2.5 font-semibold text-sm" isLoading={isSubmitting}>
                Authenticate Badge Access
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-sans">
          Unauthorized access is strictly prohibited and subject to legal prosecution under criminal law.
        </p>
      </div>
    </div>
  );
};

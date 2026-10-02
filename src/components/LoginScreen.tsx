import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onBackToLanding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToLanding }) => {
  const { login } = useCrm();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f8fc] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md w-full">
        {onBackToLanding && (
          <div className="mb-4 text-center sm:text-left">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
            >
              <span>← Back to Public Homepage</span>
            </button>
          </div>
        )}

        {/* Brand & Clinic Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3">
            <span className="font-extrabold text-xl tracking-wider">CF</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Clinic Flow CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Demo Dental & Aesthetic Clinic · Dubai Marina
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access the clinical triage, WhatsApp inbox, and patient schedule
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Protected
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 mt-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Accounts (Super Admin is strictly manual & private) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Demo Staff Accounts</span>
              <span className="text-[10px] text-slate-400 font-normal">Super Admin credentials private</span>
            </p>

            <div className="space-y-1.5">
              {/* Admin: Dr. Tariq */}
              <button
                type="button"
                onClick={() => handleQuickFill('tariq.mansoor@democlinic.ae', 'ClinicAdmin2026!')}
                className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                    TM
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Dr. Tariq Mansoor <span className="text-[10px] text-slate-500">(Admin)</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">tariq.mansoor@democlinic.ae</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Select
                </span>
              </button>

              {/* Staff: Layla */}
              <button
                type="button"
                onClick={() => handleQuickFill('layla.amiri@democlinic.ae', 'StaffLayla2026!')}
                className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-500 text-white flex items-center justify-center text-xs font-bold">
                    LA
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Layla Al-Amiri <span className="text-[10px] text-slate-500">(Staff)</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">layla.amiri@democlinic.ae</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Select
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Access Control · Healthcare Security Enforced</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('admin@aiinteriorplanner.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiService.login(email, password);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] border border-slate-100">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-slate-900 uppercase leading-none">
                  AI INTERIOR
                </span>
                <span className="text-[11px] font-semibold tracking-widest text-primary uppercase leading-tight">
                  PLANNER
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Welcome Back!
              </h1>
              <p className="text-sm text-slate-500">
                Sign in to continue to your interior design workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember Me</span>
                </label>
                <a href="#forgot" className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Photo Panel */}
        <div className="lg:col-span-6 p-4 bg-slate-50 relative hidden lg:flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-inner group">
            <img
              src="/interior_hero.jpg"
              alt="Modern Luxury Interior"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            
            {/* Floating Glassmorphism Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-1 text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Powered Studio</span>
              </div>
              <p className="text-sm font-medium leading-snug text-slate-100">
                Parametric 2D to 3D room design, intelligent costing & seamless quotation workflow.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

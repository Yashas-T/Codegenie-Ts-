import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldQuestion, ArrowRight, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    securityQuestion: 'What is your pet name?',
    securityAnswer: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (!success) setError('Invalid email or password');
      } else {
        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.securityQuestion,
          formData.securityAnswer
        );
        if (!success) setError('Email already registered');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
     alert(`[SIMULATION] Sending OTP to ${formData.email || 'user email'} via SMTP...\nOTP: 123456`);
     const otp = prompt("Enter the OTP sent to your email (Use 123456):");
     if (otp === '123456') {
         alert("Verified! You can now reset your password. (Mock flow end)");
         setIsForgotPassword(false);
     } else {
         alert("Invalid OTP. Try using security questions.");
     }
  };

  if (isForgotPassword) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95">
                  <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Reset Password</h2>
                  <p className="text-slate-400 mb-6 text-sm">Enter your email to receive a verification OTP.</p>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full bg-slate-950/50 border border-slate-700 p-4 rounded-xl mb-4 text-white focus:border-cyan-500 outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <div className="flex gap-3">
                      <button onClick={handleForgotPassword} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-medium transition-colors">Send OTP</button>
                      <button onClick={() => setIsForgotPassword(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors">Cancel</button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Refined Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 animate-pulse duration-[12000ms]"></div>

      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tighter">
            CodeGenie
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {isLogin ? 'Welcome back, developer.' : 'Join the coding revolution.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
              <input
                required
                type="text"
                placeholder="Full Name"
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input
              required
              type="email"
              placeholder="Email Address"
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input
              required
              type="password"
              placeholder="Password"
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative group">
                <ShieldQuestion className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <select
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
                  value={formData.securityQuestion}
                  onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                >
                  <option>What is your pet name?</option>
                  <option>What is your mother's maiden name?</option>
                  <option>Which city were you born in?</option>
                </select>
              </div>
              <div className="relative group">
                <input
                  required
                  type="text"
                  placeholder="Security Answer"
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  value={formData.securityAnswer}
                  onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                />
              </div>
            </>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">{error}</div>}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        {isLogin && (
            <div className="mt-4 text-center">
                <button onClick={() => setIsForgotPassword(true)} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Forgot Password?</button>
            </div>
        )}

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
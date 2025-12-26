
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Lock, Loader2, Briefcase } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    setTimeout(() => {
      try {
        login(email, password);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center">
        
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
            <Briefcase className="w-10 h-10 text-white" />
        </div>

        <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">JP FORRO</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Gestão Financeira e Administrativa</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="w-full space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-rose-500 font-bold text-center bg-rose-50 py-3 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acessar Sistema"}
          </button>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
               Financeiro • v2.0
            </p>
            {!loading && !error && (
                <p className="text-[9px] text-slate-400 mt-2">Senha padrão: 123456</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;

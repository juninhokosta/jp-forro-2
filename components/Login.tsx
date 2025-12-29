
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Lock, Loader2, Briefcase, ChevronRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login, loginWithGoogle } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError("Erro ao autenticar com Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center relative overflow-hidden">
        
        {/* Decorativo de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl relative z-10">
            <Briefcase className="w-10 h-10 text-white" />
        </div>

        <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">JP FORRO</h2>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Gestão Financeira Restrita</p>
        </div>

        <div className="w-full space-y-6 relative z-10">
          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-4 py-4.5 bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-700 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-70 group shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-xs uppercase tracking-widest">Entrar com Google</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ou Manual</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="email"
                  placeholder="usuario@jpforro.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-black uppercase tracking-tight"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-black tracking-widest"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-rose-500 font-black text-center bg-rose-50 py-3 rounded-xl border border-rose-100 uppercase tracking-widest">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acessar Painel"}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Conectado ao Supabase Cloud</p>
            </div>
            <p className="text-[8px] text-slate-300 font-black uppercase">Exclusivo para Ivo & Pedro</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

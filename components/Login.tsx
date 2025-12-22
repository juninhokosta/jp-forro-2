
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, LogInIcon, Mail, Key, ArrowRight, Loader2, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { users, login } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (!password) {
      setError("Por favor, insira sua senha.");
      return;
    }

    setLoading(true);
    
    // Pequeno delay para simular processamento
    setTimeout(() => {
      try {
        login(email, password);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 px-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm space-y-8 border border-white/20 relative overflow-hidden">
        
        <div className="text-center space-y-3 relative">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
            <LogInIcon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">JP Forro</h1>
            <p className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Gestão Financeira</p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-700 font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2">
             <p className="text-[10px] text-blue-700 font-bold leading-tight">
               <span className="uppercase tracking-widest text-blue-800">Dica:</span> Se for seu primeiro acesso, use a senha padrão <span className="text-blue-900 font-black">123456</span>.
             </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Acessar Sistema <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 pt-6">
          <div className="flex justify-center gap-2 mb-3">
             {users.map(u => (
               <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100" title={u.name}>
                 <img src={u.avatar} alt={u.name} />
               </div>
             ))}
             {users.length < 2 && (
               <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                 +
               </div>
             )}
          </div>
          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
            {users.length}/2 Usuários Cadastrados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

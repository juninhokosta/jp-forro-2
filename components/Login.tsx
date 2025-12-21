
import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, LogInIcon, Mail, Key, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

declare const google: any;

const Login: React.FC = () => {
  const { users, login } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para fluxo de e-mail
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    // Verifica se já temos 2 usuários e se este e-mail é um deles
    const isAlreadyUser = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (users.length >= 2 && !isAlreadyUser) {
      setError("Acesso negado. Esta sociedade já possui os 2 membros cadastrados.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simula envio de e-mail
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      setStep('code');
      setLoading(false);
      // Em um app real, o código iria para o e-mail. Aqui mostramos na tela para teste.
    }, 1000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentCode) {
      setLoading(true);
      try {
        login(email);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      setError("Código incorreto. Tente novamente.");
    }
  };

  useEffect(() => {
    const handleGoogleResponse = (response: any) => {
      setLoading(true);
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const payload = JSON.parse(jsonPayload);
        login(payload.email, payload.name);
      } catch (err: any) {
        setError(err.message || "Erro ao processar login Google.");
      } finally {
        setLoading(false);
      }
    };

    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "847668633758-csq0p6v6e297oaq6e0e980e98e98e98.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: 320, shape: "pill" }
      );
    }
  }, [login]);

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

        <div className="space-y-6">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Código Enviado</p>
                    <p className="text-[12px] text-blue-700 leading-tight">Para testar, use o código: <span className="font-black text-blue-900">{sentCode}</span></p>
                </div>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-[0.5em] font-bold text-lg"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar e Entrar"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Alterar E-mail
              </button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white/95 px-3 text-slate-400">Ou use o Google</span></div>
          </div>

          <div className="flex justify-center">
            <div id="googleBtn" className={loading ? 'opacity-30 pointer-events-none' : ''}></div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-2 text-center border-t border-slate-100 pt-6">
          <div className="flex justify-center gap-2 mb-3">
             {users.map(u => (
               <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden" title={u.name}>
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
            {users.length}/2 Usuários na Sociedade
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

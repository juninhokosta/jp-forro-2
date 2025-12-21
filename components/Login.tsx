
import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, LogInIcon, Info } from 'lucide-react';

declare const google: any;

const Login: React.FC = () => {
  const { users, login } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      setLoading(true);
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const email = payload.email.toLowerCase();

        // Verifica se o email é um dos permitidos (ignora case)
        const isAuthorized = users.some(u => u.email.toLowerCase() === email);

        if (isAuthorized) {
          login(email);
        } else {
          setError(`O email ${email} não está na lista de sócios autorizados.`);
        }
      } catch (err) {
        console.error("Erro no login", err);
        setError("Erro ao processar os dados do Google.");
      } finally {
        setLoading(false);
      }
    };

    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "847668633758-csq0p6v6e297oaq6e0e980e98e98e98.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { 
          theme: "outline", 
          size: "large", 
          width: 280, 
          text: "signin_with", 
          shape: "pill",
          logo_alignment: "left"
        }
      );
    }
  }, [users, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 px-4">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl w-full max-w-sm space-y-8 border border-white/20">
        <div className="text-center space-y-4">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <LogInIcon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">JP Forro</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">Gestão Financeira</p>
          </div>
          <p className="text-slate-500 text-sm">Acesso restrito aos sócios administradores</p>
        </div>

        <div className="flex flex-col items-center gap-6 py-2">
          <div id="googleBtn" className={`transition-opacity ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}></div>
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-600 font-semibold leading-tight">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-400">
                <Info className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Acesso Rápido (Sócios)</span>
            </div>
            
            <div className="flex justify-center gap-4">
              {users.map(user => (
                <button 
                  key={user.id}
                  onClick={() => login(user.id)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm transition-all group-hover:border-blue-500 group-hover:scale-110 group-active:scale-95">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">{user.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-center text-[9px] text-slate-400 mt-8 italic">
            Sociedade 50/50 • © 2024 JP Forro
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

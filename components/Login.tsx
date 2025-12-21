
import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { LogIn, ShieldAlert, LogInIcon } from 'lucide-react';

// Add declaration for Google Identity Services global variable
declare const google: any;

const Login: React.FC = () => {
  const { users, login } = useApp();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      try {
        // Decodificando o payload do JWT retornado pelo Google
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const email = payload.email;

        // Verifica se o email está na lista de sócios
        const isAuthorized = users.some(u => u.email === email);

        if (isAuthorized) {
          login(email);
        } else {
          setError(`Acesso negado para o email: ${email}. Apenas sócios autorizados podem acessar.`);
        }
      } catch (err) {
        console.error("Erro ao processar login Google", err);
        setError("Ocorreu um erro ao tentar realizar o login.");
      }
    };

    // Inicializa o Google One Tap / Sign In
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "847668633758-csq0p6v6e297oaq6e0e980e98e98e98.apps.googleusercontent.com", // Substitua pelo seu Client ID real se tiver um
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: 320, text: "signin_with", shape: "pill" }
      );
    }
  }, [users, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 px-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-8 border border-white/20">
        <div className="text-center space-y-4">
          <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3 transition-transform hover:rotate-0 duration-300">
            <LogInIcon className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">JP Forro</h1>
            <p className="text-blue-600 font-semibold uppercase tracking-widest text-xs">Gestão Financeira</p>
          </div>
          <p className="text-slate-500 text-sm">Autentique-se com sua conta Google para continuar</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div id="googleBtn" className="min-h-[44px]"></div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sócios Autorizados</p>
            <div className="flex justify-center -space-x-3">
              {users.map(user => (
                <div key={user.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md group relative">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <span className="text-[8px] text-white font-bold">{user.name.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Sociedade 50/50 - Acesso restrito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

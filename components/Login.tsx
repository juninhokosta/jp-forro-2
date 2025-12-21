
import React from 'react';
import { useApp } from '../AppContext';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { users, login } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">JP Forro - Financeiro</h1>
          <p className="text-slate-500">Selecione seu perfil para acessar o sistema</p>
        </div>

        <div className="space-y-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => login(user.id)}
              className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4 border-2 border-slate-100 group-hover:border-blue-400" />
              <div className="text-left">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-slate-400">
            Sociedade 50/50 - Acesso restrito aos administradores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

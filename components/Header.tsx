
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User as UserIcon, Lock, X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { currentUser, changePassword } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPass, setNewPass] = useState('');

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Resumo';
      case 'os': return 'Ordens';
      case 'expenses': return 'Despesas';
      case 'quotes': return 'Orçamentos';
      case 'reports': return 'Relatórios';
      default: return 'JP Forro';
    }
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 4) {
      alert("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    changePassword(newPass);
    setNewPass('');
    setShowPasswordModal(false);
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight truncate">{getTitle()}</h2>
        <p className="text-xs text-slate-500 hidden md:block">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Alterar Senha"
        >
          <Lock className="w-5 h-5" />
        </button>
        
        <div className="text-right hidden sm:block">
          <p className="text-xs md:text-sm font-semibold text-slate-900 truncate max-w-[100px]">{currentUser?.name}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-black">Sócio</p>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-900">Alterar Senha</h3>
               <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleChangePass} className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Senha</label>
                 <input 
                   type="password" 
                   value={newPass}
                   onChange={e => setNewPass(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Mínimo 4 caracteres"
                   autoFocus
                 />
               </div>
               <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase text-[10px] tracking-widest">Atualizar Senha</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

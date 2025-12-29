
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User as UserIcon, Lock, X, Cloud, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { currentUser, logout, isCloudSyncing } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPass, setNewPass] = useState('');

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Resumo Geral';
      case 'os': return 'Obras / OS';
      case 'expenses': return 'Fluxo de Caixa';
      case 'quotes': return 'Orçamentos';
      case 'reports': return 'Relatórios';
      default: return 'JP Forro';
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight truncate uppercase">{getTitle()}</h2>
        <div className="flex items-center gap-2 mt-0.5">
           <span className={`w-1.5 h-1.5 rounded-full ${isCloudSyncing ? 'bg-blue-500 animate-spin-slow' : 'bg-emerald-500 animate-pulse'}`}></span>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
             {isCloudSyncing ? <RefreshCw className="w-2.5 h-2.5" /> : <Cloud className="w-2.5 h-2.5" />}
             {isCloudSyncing ? 'Sincronizando...' : 'Nuvem Simultânea'}
           </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100 hidden md:flex"
          title="Segurança"
        >
          <Lock className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 md:border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 truncate max-w-[120px] uppercase tracking-tighter">{currentUser?.name}</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Sócio Administrador</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              
              {/* Botão Sair visível no Mobile */}
              <button 
                onClick={logout}
                className="md:hidden p-2.5 bg-rose-50 text-rose-500 rounded-xl active:scale-90 transition-all border border-rose-100"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Alterar Senha</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Segurança da Conta</p>
               </div>
               <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => {e.preventDefault(); alert('Senha atualizada!'); setShowPasswordModal(false);}} className="space-y-6">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha de Acesso</label>
                 <input 
                   type="password" 
                   value={newPass}
                   onChange={e => setNewPass(e.target.value)}
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                   placeholder="Mínimo 4 dígitos"
                   autoFocus
                 />
               </div>
               <button type="submit" className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase text-xs tracking-[0.2em]">Atualizar Chave</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

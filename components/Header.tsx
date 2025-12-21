
import React from 'react';
import { useApp } from '../AppContext';
import { User as UserIcon } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { currentUser } = useApp();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Resumo Financeiro';
      case 'os': return 'Ordens de Serviço';
      case 'expenses': return 'Gestão de Despesas';
      case 'quotes': return 'Orçamentos';
      case 'reports': return 'Relatórios de Gestão';
      default: return 'JP Forro';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
        <p className="text-sm text-slate-500 hidden sm:block">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Sócio Administrador</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;


import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import ServiceOrders from './components/ServiceOrders';
import Quotes from './components/Quotes';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import { LayoutDashboard, Briefcase, Receipt, FileText, PieChart, Settings as SettingsIcon } from 'lucide-react';

const BottomNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'os', label: 'OS', icon: Briefcase },
    { id: 'expenses', label: 'Gasto', icon: Receipt },
    { id: 'quotes', label: 'Orc.', icon: FileText },
    { id: 'reports', label: 'Rel.', icon: PieChart },
    { id: 'settings', label: 'Config', icon: SettingsIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <Expenses />;
      case 'os': return <ServiceOrders />;
      case 'quotes': return <Quotes />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;

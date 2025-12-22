
import React from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, TrendingDown, Users, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { OSStatus } from '../types';

const Dashboard: React.FC = () => {
  const { transactions, serviceOrders, users } = useApp();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totals = currentMonthTransactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const userStats = users.map(u => {
    const uTransactions = currentMonthTransactions.filter(t => t.userId === u.id);
    const income = uTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = uTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return { name: u.name, income, expense };
  });

  const osCounts = {
    total: serviceOrders.length,
    active: serviceOrders.filter(os => os.status !== OSStatus.FINISHED && os.status !== OSStatus.PAID).length,
    completed: serviceOrders.filter(os => os.status === OSStatus.PAID).length
  };

  const chartData = [
    { name: 'Geral', Entrada: totals.income, Saída: totals.expense },
    ...userStats.map(s => ({ name: s.name, Entrada: s.income, Saída: s.expense }))
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      {/* KPI Cards Responsivos: 2 colunas no mobile, 4 no desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <span className="text-[9px] md:text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-tighter">Entradas</p>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.income)}</h3>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-rose-50 rounded-lg">
              <TrendingDown className="w-4 h-4 md:w-6 md:h-6 text-rose-600" />
            </div>
            <span className="text-[9px] md:text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-5%</span>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-tighter">Saídas</p>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.expense)}</h3>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-tighter">Saldo</p>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.income - totals.expense)}</h3>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-amber-50 rounded-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-tighter">Ativas</p>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1">{osCounts.active}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts Section: Oculto ou simplificado no mobile se necessário, mas Recharts é responsivo */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="text-base md:text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Sociedade
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                <Bar dataKey="Entrada" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saída" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividades Recentes: Mais compacto no mobile */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base md:text-lg font-black text-slate-800">Recentes</h3>
          </div>
          <div className="space-y-3">
            {currentMonthTransactions.length === 0 && (
                <p className="text-center text-slate-500 py-10 text-xs">Nenhuma movimentação.</p>
            )}
            {currentMonthTransactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 md:p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> : <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-800 truncate">{t.description}</p>
                    <p className="text-[9px] md:text-xs text-slate-500 truncate">{t.userName} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-black text-xs md:text-sm shrink-0 ml-2 ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

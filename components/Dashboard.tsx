
import React from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, TrendingDown, Users, Wallet, Clock, Scale } from 'lucide-react';
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

  const netProfit = totals.income - totals.expense;

  const userStats = users.map(u => {
    const uTransactions = currentMonthTransactions.filter(t => t.userId === u.id);
    const income = uTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = uTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return { name: u.name, income, expense };
  });

  const osCounts = {
    total: serviceOrders.length,
    active: serviceOrders.filter(os => os.status !== OSStatus.FINISHED && os.status !== OSStatus.PAID && !os.archived).length,
    completed: serviceOrders.filter(os => os.status === OSStatus.PAID).length
  };

  const chartData = [
    { name: 'Total', Entrada: totals.income, Saída: totals.expense },
    ...userStats.map(s => ({ name: s.name.split(' ')[0], Entrada: s.income, Saída: s.expense }))
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-20">
      {/* Resumo da Sociedade */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Scale className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Resultado Mensal</h2>
            <p className="text-blue-300 text-xs md:text-sm font-black uppercase tracking-[0.2em] mt-3">Sociedade Ivo & Pedro (50/50)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem]">
                <p className="text-[10px] font-black text-blue-200 uppercase mb-2 tracking-widest">Lucro Líquido Total</p>
                <h3 className="text-3xl font-black text-emerald-400 tracking-tighter">{formatCurrency(netProfit)}</h3>
             </div>
             <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl">
                <p className="text-[10px] font-black text-blue-100 uppercase mb-2 tracking-widest">Cada Sócio Recebe</p>
                <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(netProfit / 2)}</h3>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Entradas</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.income)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Saídas</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.expense)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Saldo Caixa</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 truncate">{formatCurrency(totals.income - totals.expense)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Obras Ativas</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1">{osCounts.active}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <Users className="w-5 h-5 text-blue-500" />
              Desempenho por Sócio
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '20px'}} />
                <Bar dataKey="Entrada" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="Saída" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Fluxo Recente</h3>
          </div>
          <div className="space-y-4">
            {currentMonthTransactions.length === 0 && (
                <div className="py-20 text-center opacity-30">
                  <p className="text-xs font-black uppercase tracking-widest">Sem atividades este mês</p>
                </div>
            )}
            {currentMonthTransactions.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{t.description}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.userName} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-black text-xs shrink-0 ml-4 ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
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

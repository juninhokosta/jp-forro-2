
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, TrendingDown, Users, Wallet, Clock, Scale, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { OSStatus } from '../types';

const Dashboard: React.FC = () => {
  const { transactions, serviceOrders, users } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const netProfit = totals.income - totals.expense;

  const userStats = users.map(u => {
    const uTransactions = filteredTransactions.filter(t => t.userId === u.id);
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
    { name: 'Total', Entrada: totals.income, Saída: totals.expense },
    ...userStats.map(s => ({ name: s.name.split(' ')[0], Entrada: s.income, Saída: s.expense }))
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-20">
      {/* Novo Cabeçalho Moderno com Seletor */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 w-fit p-2 rounded-2xl backdrop-blur-md">
              <button 
                onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-4">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-black text-white uppercase tracking-widest">{months[selectedMonth]} {selectedYear}</span>
              </div>
              <button 
                onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">Resultado <br/> da Sociedade</h2>
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-4">Partilha Ivo & Pedro • 50/50</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-64 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-4">Lucro Líquido</p>
              <h3 className="text-4xl font-black text-emerald-400 tracking-tighter mb-6">{formatCurrency(netProfit)}</h3>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-xl"><Scale className="w-5 h-5 text-blue-400" /></div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-white/40 uppercase">Cada Sócio</p>
                   <p className="text-lg font-black text-white">{formatCurrency(netProfit / 2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Entradas', val: totals.income, icon: TrendingUp, color: 'emerald' },
          { label: 'Saídas', val: totals.expense, icon: TrendingDown, color: 'rose' },
          { label: 'Saldo Caixa', val: totals.income - totals.expense, icon: Wallet, color: 'blue' },
          { label: 'Obras Ativas', val: osCounts.active, icon: Clock, color: 'amber', isCurrency: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 truncate tracking-tight">
              {kpi.isCurrency === false ? kpi.val : formatCurrency(kpi.val as number)}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <Users className="w-5 h-5 text-blue-500" />
              Performance dos Sócios
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
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Fluxo de Caixa Mensal</h3>
          </div>
          <div className="space-y-4">
            {filteredTransactions.length === 0 && (
                <div className="py-20 text-center opacity-30">
                  <p className="text-xs font-black uppercase tracking-widest">Sem atividades no período selecionado</p>
                </div>
            )}
            {filteredTransactions.slice(0, 6).map(t => (
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

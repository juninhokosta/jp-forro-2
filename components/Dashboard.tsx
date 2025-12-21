
import React from 'react';
import { useApp } from '../AppContext';
import { TrendingUp, TrendingDown, Users, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { OSStatus } from '../types';

const Dashboard: React.FC = () => {
  const { transactions, serviceOrders, users } = useApp();

  // Filter current month
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

  // Calc by user
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Entradas (Mês)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totals.income)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">-5%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Saídas (Mês)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totals.expense)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Saldo Disponível</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totals.income - totals.expense)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">OS Ativas</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{osCounts.active}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Divisão por Usuário
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Entrada" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saída" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Activities */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Atividades Recentes</h3>
            <button className="text-sm text-blue-600 font-semibold hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {currentMonthTransactions.length === 0 && (
                <p className="text-center text-slate-500 py-10">Nenhuma movimentação este mês.</p>
            )}
            {currentMonthTransactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.userName} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OS Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status das Ordens de Serviço</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(OSStatus).map(status => {
                  const count = serviceOrders.filter(os => os.status === status).length;
                  return (
                      <div key={status} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                          <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{status}</p>
                              <p className="text-xl font-bold text-slate-900">{count}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                              status === OSStatus.PAID ? 'bg-emerald-500' : 
                              status === OSStatus.FINISHED ? 'bg-blue-500' :
                              status === OSStatus.IN_PROGRESS ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;

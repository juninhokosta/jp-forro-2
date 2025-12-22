
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Download, FileText, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Reports: React.FC = () => {
  const { transactions, users } = useApp();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
  });

  const totals = filtered.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
  }, { income: 0, expense: 0 });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const exportPDF = () => {
      // O CSS no index.html garante que a barra lateral e botões não apareçam no PDF
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Relatório de {months[month]} de {year}</h3>
                <p className="text-sm text-slate-500">Resumo consolidado da sociedade</p>
            </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto no-print">
            <select 
                value={month} 
                onChange={e => setMonth(parseInt(e.target.value))}
                className="flex-1 md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold"
            >
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
            >
                <Download className="w-4 h-4" /> Exportar PDF
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md self-start mb-4 uppercase tracking-tighter">Total Entradas</span>
              <div>
                  <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totals.income)}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Bruto arrecadado</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md self-start mb-4 uppercase tracking-tighter">Total Saídas</span>
              <div>
                  <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totals.expense)}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><ArrowDownRight className="w-3 h-3" /> Custo operacional</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md self-start mb-4 uppercase tracking-tighter">Lucro Líquido</span>
              <div>
                  <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totals.income - totals.expense)}</h4>
                  <p className="text-sm text-slate-500 mt-1">Resultado para divisão</p>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Detalhamento por Usuário
              </h4>
          </div>
          <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                          <th className="px-6 py-4">Sócio</th>
                          <th className="px-6 py-4">Entradas</th>
                          <th className="px-6 py-4">Saídas</th>
                          <th className="px-6 py-4">Saldo Próprio</th>
                          <th className="px-6 py-4 text-right">A Receber/Pagar (50/50)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {users.map(u => {
                          const uTrans = filtered.filter(t => t.userId === u.id);
                          const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
                          const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
                          const splitBalance = ((totals.income - totals.expense) / 2) - (uInc - uExp);
                          
                          return (
                              <tr key={u.id}>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                          <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                          <span className="font-semibold text-slate-800">{u.name}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(uInc)}</td>
                                  <td className="px-6 py-4 text-rose-600 font-medium">{formatCurrency(uExp)}</td>
                                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(uInc - uExp)}</td>
                                  <td className="px-6 py-4 text-right">
                                      <span className={`font-bold ${splitBalance < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {splitBalance < 0 ? 'Receber ' : 'Pagar '}
                                          {formatCurrency(Math.abs(splitBalance))}
                                      </span>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
          <div className="p-6 bg-blue-50 text-blue-800 text-sm italic">
              <strong>Nota de Transparência:</strong> Este relatório considera o fechamento mensal da sociedade. O "Saldo Próprio" indica o que cada sócio movimentou individualmente, enquanto o "A Receber/Pagar" faz o ajuste para que ambos terminem o mês com 50% do lucro total.
          </div>
      </div>
    </div>
  );
};

export default Reports;

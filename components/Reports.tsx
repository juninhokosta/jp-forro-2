
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Download, FileText, Calendar, ArrowUpRight, ArrowDownRight, Printer, Briefcase, User, Search, Calculator, MapPin, Receipt, TrendingUp, Users } from 'lucide-react';
import { OSStatus } from '../types';

const Reports: React.FC = () => {
  const { transactions, users, serviceOrders } = useApp();
  const [reportType, setReportType] = useState<'MONTHLY' | 'OS'>('MONTHLY');
  const [selectedOSId, setSelectedOSId] = useState<string>('');
  
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleExportPDF = () => {
      setTimeout(() => {
        window.print();
      }, 100);
  };

  // Lógica Relatório Mensal
  const filteredMonthly = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthlyTotals = filteredMonthly.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
  }, { income: 0, expense: 0 });

  // Lógica Relatório OS
  const selectedOS = serviceOrders.find(os => os.id === selectedOSId);
  const osTransactions = transactions.filter(t => t.osId === selectedOSId);
  const osIncome = osTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const osExpense = osTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const osProfit = osIncome - osExpense;

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      {/* Seletor de Tipo de Relatório */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm no-print">
        <button 
          onClick={() => setReportType('MONTHLY')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'MONTHLY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Relatório Mensal
        </button>
        <button 
          onClick={() => setReportType('OS')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'OS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Relatório por Obra
        </button>
      </div>

      {reportType === 'MONTHLY' ? (
        <>
          {/* Cabeçalho Relatório Mensal */}
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
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold">
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all">
                    <Printer className="w-4 h-4" /> Exportar
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Entradas</span>
                  <h4 className="text-3xl font-black text-slate-900 mt-4">{formatCurrency(monthlyTotals.income)}</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase">Saídas</span>
                  <h4 className="text-3xl font-black text-slate-900 mt-4">{formatCurrency(monthlyTotals.expense)}</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Lucro Líquido</span>
                  <h4 className="text-3xl font-black text-slate-900 mt-4">{formatCurrency(monthlyTotals.income - monthlyTotals.expense)}</h4>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100"><h4 className="font-black text-slate-800 flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Fechamento por Sócio</h4></div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                              <th className="px-6 py-4">Sócio</th>
                              <th className="px-6 py-4">Entradas</th>
                              <th className="px-6 py-4">Saídas</th>
                              <th className="px-6 py-4 text-right">Ajuste (50/50)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {users.map(u => {
                              const uTrans = filteredMonthly.filter(t => t.userId === u.id);
                              const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
                              const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                              const uBal = uInc - uExp;
                              const target = (monthlyTotals.income - monthlyTotals.expense) / 2;
                              const diff = target - uBal;
                              return (
                                  <tr key={u.id}>
                                      <td className="px-6 py-4 flex items-center gap-3 font-bold text-slate-800"><img src={u.avatar} className="w-8 h-8 rounded-full" /> {u.name}</td>
                                      <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(uInc)}</td>
                                      <td className="px-6 py-4 text-rose-600 font-bold">{formatCurrency(uExp)}</td>
                                      <td className="px-6 py-4 text-right">
                                          <span className={`font-black text-xs ${diff <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{diff <= 0 ? 'Pagar ' : 'Receber '}{formatCurrency(Math.abs(diff))}</span>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
        </>
      ) : (
        <>
          {/* Cabeçalho Relatório OS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-4 no-print">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selecionar Obra</label>
                <select 
                  value={selectedOSId} 
                  onChange={e => setSelectedOSId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma OS...</option>
                  {serviceOrders.map(os => (
                    <option key={os.id} value={os.id}>{os.id} - {os.customerName}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleExportPDF} disabled={!selectedOSId} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs disabled:opacity-50">Imprimir Fechamento</button>
            </div>

            {selectedOS && (
              <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">{selectedOS.id}</span>
                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{selectedOS.status}</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedOS.customerName}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1"><MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl border border-blue-100 uppercase tracking-widest">
                      Contrato: {formatCurrency(selectedOS.totalValue)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Recebido</p>
                      <p className="text-lg font-black text-emerald-700">{formatCurrency(osIncome)}</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
                      <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Gasto</p>
                      <p className="text-lg font-black text-rose-700">{formatCurrency(osExpense)}</p>
                    </div>
                    <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                      <p className="text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1">Lucro Obra</p>
                      <p className="text-lg font-black">{formatCurrency(osProfit)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedOSId && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 p-8 rounded-full inline-block mb-4"><Search className="w-12 h-12 text-slate-200" /></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Selecione uma obra para gerar o fechamento detalhado</p>
            </div>
          )}

          {selectedOS && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {/* Extrato Detalhado de Despesas */}
              <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-[10px] flex items-center gap-2 uppercase tracking-widest">
                    <Receipt className="w-4 h-4 text-rose-500" /> Extrato de Despesas da Obra
                  </h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{osTransactions.filter(t => t.type === 'EXPENSE').length} itens</span>
                </div>
                <div className="overflow-x-auto max-h-[600px] flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Sócio / Descrição</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {osTransactions.filter(t => t.type === 'EXPENSE').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                        <tr key={t.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-0.5">{t.userName}</span>
                                <p className="font-bold text-slate-800 leading-tight">{t.description}</p>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="font-black text-rose-600 text-sm">{formatCurrency(t.amount)}</span>
                          </td>
                        </tr>
                      ))}
                      {osTransactions.filter(t => t.type === 'EXPENSE').length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-300 italic text-xs font-black uppercase tracking-widest">Nenhuma despesa lançada nesta obra.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Divisão Nominal de Resultados */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h4 className="font-black text-white text-[10px] flex items-center gap-2 uppercase tracking-widest">
                        <Users className="w-4 h-4 text-blue-400" /> Divisão Entre Sócios (50/50)
                    </h4>
                    <span className="text-[10px] font-black text-blue-400 uppercase bg-blue-400/10 px-2 py-1 rounded">Sociedade Ativa</span>
                  </div>
                  <div className="p-8 space-y-6">
                    {users.map((u) => {
                      const uTrans = osTransactions.filter(t => t.userId === u.id);
                      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
                      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                      
                      // Lógica de fechamento correta:
                      // Cada sócio tem direito a 50% do lucro real (Receita - Gastos)
                      // O sócio que gastou dinheiro do bolso (uExp) deve ser reembolsado.
                      // O sócio que recebeu dinheiro do cliente (uInc) deve abater esse valor do seu saldo final.
                      const targetProfitShare = osProfit / 2;
                      const finalBalance = targetProfitShare + uExp - uInc;

                      return (
                        <div key={u.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 group transition-all hover:bg-white/[0.08]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img src={u.avatar} className="w-14 h-14 rounded-full border-2 border-white/20 shadow-xl" alt={u.name} />
                              <div>
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">SÓCIO</span>
                                <span className="text-lg font-black text-white tracking-tight">{u.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">PARTE NO LUCRO</p>
                              <p className="text-lg font-black text-blue-400">{formatCurrency(targetProfitShare)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[8px] font-black text-rose-400/60 uppercase tracking-widest mb-1">GASTOU (REEMBOLSO)</p>
                              <p className="text-sm font-black text-rose-400">{formatCurrency(uExp)}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest mb-1">RECEBEU (ABATER)</p>
                              <p className="text-sm font-black text-emerald-400">{formatCurrency(uInc)}</p>
                            </div>
                          </div>

                          <div className={`p-5 rounded-2xl flex justify-between items-center transition-all shadow-xl ${finalBalance >= 0 ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-rose-600 text-white shadow-rose-900/40'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-black/20 rounded-lg">
                                    {finalBalance >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {finalBalance >= 0 ? 'A Receber' : 'A Pagar'}
                                </span>
                            </div>
                            <span className="text-xl font-black tracking-tighter">{formatCurrency(Math.abs(finalBalance))}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-6 bg-blue-500/10 border-t border-white/5">
                    <p className="text-[10px] text-blue-300 font-bold italic text-center leading-relaxed">
                        ⚠️ Lógica: O lucro de {formatCurrency(osProfit)} foi dividido em duas partes de {formatCurrency(osProfit / 2)}. <br/>
                        As despesas pagas por cada sócio são reembolsadas integralmente do montante recebido.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retorno sobre Contrato</h4>
                        <p className="text-xl font-black text-slate-900 tracking-tight">
                            {selectedOS.totalValue > 0 ? ((osProfit / selectedOS.totalValue) * 100).toFixed(1) : 0}% de Lucratividade
                        </p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

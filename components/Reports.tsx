
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Download, FileText, Calendar, ArrowUpRight, ArrowDownRight, Printer, Briefcase, User, Search, Calculator, MapPin, Receipt, TrendingUp, Users, Scale } from 'lucide-react';
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
      window.print();
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
      {/* Seletor de Tipo de Relatório - Oculto na Impressão */}
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
                                      <td className="px-6 py-4 flex items-center gap-3 font-bold text-slate-800">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full" /> {u.name}
                                      </td>
                                      <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(uInc)}</td>
                                      <td className="px-6 py-4 text-rose-600 font-bold">{formatCurrency(uExp)}</td>
                                      <td className="px-6 py-4 text-right">
                                          <span className={`font-black text-xs ${diff <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {diff <= 0 ? 'Pagar ' : 'Receber '}
                                            {formatCurrency(Math.abs(diff))}
                                          </span>
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
          {/* Cabeçalho Relatório OS - Oculto na Impressão */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 no-print">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selecionar Obra para Fechamento</label>
                <select 
                  value={selectedOSId} 
                  onChange={e => setSelectedOSId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Escolha a Obra...</option>
                  {serviceOrders.map(os => (
                    <option key={os.id} value={os.id}>{os.id} - {os.customerName}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleExportPDF} 
                disabled={!selectedOSId} 
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all shadow-xl"
              >
                Imprimir Fechamento
              </button>
            </div>
          </div>

          {!selectedOSId && (
            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 no-print">
              <div className="bg-slate-50 p-8 rounded-full inline-block mb-4"><Search className="w-12 h-12 text-slate-200" /></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Selecione uma obra acima para ver o detalhamento</p>
            </div>
          )}

          {selectedOS && (
            <div className="animate-in fade-in duration-500 space-y-8">
              {/* Cabeçalho de Impressão (Visível apenas no PDF) */}
              <div className="hidden print:block border-b-4 border-slate-900 pb-6 mb-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase">JP FORRO</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Relatório de Fechamento de Obra</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-600">{selectedOS.id}</p>
                    <p className="text-xs font-bold text-slate-400">Gerado em: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Informações Gerais da Obra */}
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">{selectedOS.customerName}</h3>
                    <div className="space-y-2 mt-4">
                      <p className="text-slate-500 font-black flex items-center gap-3 text-xs uppercase tracking-tight"><MapPin className="w-4 h-4 text-blue-500 shrink-0" /> {selectedOS.customerAddress}</p>
                      <p className="text-slate-500 font-black flex items-center gap-3 text-xs uppercase tracking-tight"><Briefcase className="w-4 h-4 text-blue-500 shrink-0" /> Status: {selectedOS.status}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-900 text-white rounded-3xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">VALOR CONTRATO</p>
                        <p className="text-xl font-black tracking-tighter">{formatCurrency(selectedOS.totalValue)}</p>
                    </div>
                    <div className="p-6 bg-blue-600 text-white rounded-3xl">
                        <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">LUCRO DA OBRA</p>
                        <p className="text-xl font-black tracking-tighter">{formatCurrency(osProfit)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">TOTAL RECEBIDO</p>
                    <p className="text-lg font-black text-emerald-600">{formatCurrency(osIncome)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">TOTAL DE CUSTOS</p>
                    <p className="text-lg font-black text-rose-600">{formatCurrency(osExpense)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">PENDÊNCIA CLIENTE</p>
                    <p className="text-lg font-black text-amber-500">{formatCurrency(selectedOS.totalValue - osIncome)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">MARGEM LUCRO</p>
                    <p className="text-lg font-black text-blue-600">{((osProfit / (osIncome || 1)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Extrato Detalhado de Despesas - Fundamental para o relatório */}
              <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-rose-500" />
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Detalhamento de Custos e Despesas</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Sócio Responsável</th>
                        <th className="px-6 py-4">Descrição do Gasto</th>
                        <th className="px-6 py-4 text-right">Valor Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {osTransactions.filter(t => t.type === 'EXPENSE').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => (
                        <tr key={t.id} className="text-sm">
                          <td className="px-6 py-4 text-slate-500 font-bold">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-black text-blue-600 uppercase text-[10px] tracking-tighter">{t.userName}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{t.description}</p>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t.category}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-rose-600">{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                      {osTransactions.filter(t => t.type === 'EXPENSE').length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-300 italic">Nenhum custo registrado nesta obra.</td></tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-[10px] uppercase tracking-widest">Soma Total de Despesas</td>
                        <td className="px-6 py-4 text-right text-lg text-rose-600">{formatCurrency(osExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Divisão Nominal Entre Sócios (Ivo e Pedro) */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Users className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-500 rounded-2xl">
                      <Scale className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Divisão de Resultados</h3>
                      <p className="text-blue-300 text-[10px] uppercase font-black tracking-widest">Partilha 50/50 com Reembolso de Gastos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {users.map((u) => {
                      const uTrans = osTransactions.filter(t => t.userId === u.id);
                      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
                      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                      
                      // Lógica de fechamento:
                      // Lucro partilhado + Despesas pagas pelo sócio (reembolso) - Entradas recebidas pelo sócio (abate)
                      const targetProfitShare = osProfit / 2;
                      const finalBalance = targetProfitShare + uExp - uInc;

                      return (
                        <div key={u.id} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img src={u.avatar} className="w-16 h-16 rounded-full border-2 border-blue-400" alt={u.name} />
                              <div>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">SÓCIO</span>
                                <h5 className="text-xl font-black">{u.name}</h5>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">PARTE NO LUCRO</span>
                              <span className="text-lg font-black text-blue-400">{formatCurrency(targetProfitShare)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                            <div>
                              <p className="text-[9px] font-black text-rose-400 uppercase mb-1">GASTOU (REEMBOLSO)</p>
                              <p className="text-base font-black text-rose-300">{formatCurrency(uExp)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">RECEBEU (ABATER)</p>
                              <p className="text-base font-black text-emerald-300">{formatCurrency(uInc)}</p>
                            </div>
                          </div>

                          <div className={`p-6 rounded-2xl flex justify-between items-center ${finalBalance >= 0 ? 'bg-emerald-600' : 'bg-rose-600'} shadow-lg`}>
                            <div className="flex items-center gap-3">
                                {finalBalance >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{finalBalance >= 0 ? 'Receber Total' : 'Pagar Ajuste'}</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">{formatCurrency(Math.abs(finalBalance))}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                    <p className="text-[10px] text-blue-200 font-bold italic leading-relaxed">
                      * O lucro líquido de {formatCurrency(osProfit)} foi dividido igualmente entre os sócios. <br/>
                      Para garantir a justiça financeira, as despesas pagas por cada sócio são reembolsadas integralmente antes da partilha final.
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição dos Serviços no Final do Relatório */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Detalhamento Técnico do Serviço
                </h4>
                <p className="text-slate-700 font-bold text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                  "{selectedOS.description}"
                </p>
              </div>

              {/* Assinaturas (Apenas Impressão) */}
              <div className="hidden print:grid grid-cols-2 gap-20 mt-32 px-10">
                <div className="border-t border-slate-400 pt-4 text-center">
                  <p className="font-black text-sm text-slate-900">Ivo junior</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sócio Proprietário</p>
                </div>
                <div className="border-t border-slate-400 pt-4 text-center">
                  <p className="font-black text-sm text-slate-900">Pedro Augusto</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sócio Proprietário</p>
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

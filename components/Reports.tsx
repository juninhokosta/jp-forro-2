
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Calendar, ArrowUpRight, ArrowDownRight, Printer, 
  Briefcase, User, Search, MapPin, Receipt, 
  TrendingUp, Users, Scale, MessageCircle, Share2 
} from 'lucide-react';
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

  const handleWhatsAppShare = () => {
    if (!selectedOS) return;
    
    let message = `*FECHAMENTO DE OBRA - JP FORRO*\n`;
    message += `*OS:* ${selectedOS.id}\n`;
    message += `*Cliente:* ${selectedOS.customerName}\n`;
    message += `----------------------------\n`;
    message += `*VALOR CONTRATO:* ${formatCurrency(selectedOS.totalValue)}\n`;
    message += `*CUSTOS TOTAIS:* ${formatCurrency(osExpense)}\n`;
    message += `*LUCRO LÍQUIDO:* ${formatCurrency(osProfit)}\n\n`;
    
    message += `*DIVISÃO SOCIEDADE (50/50):*\n`;
    
    users.forEach(u => {
      const uTrans = osTransactions.filter(t => t.userId === u.id);
      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
      const finalBalance = (osProfit / 2) + uExp - uInc;
      
      message += `• *${u.name}:* ${finalBalance >= 0 ? 'Recebe' : 'Paga'} ${formatCurrency(Math.abs(finalBalance))}\n`;
    });
    
    message += `\n_Resumo enviado via JP Financeiro_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
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
    <div className="space-y-4 pb-24 md:pb-10">
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Relatório {months[month]} / {year}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Sociedade Ivo & Pedro</p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="flex-1 sm:flex-none px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[10px] font-bold">
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="flex-1 sm:flex-none px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[10px] font-bold">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={handleExportPDF} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-all">
                    <Printer className="w-4 h-4" />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Entradas</span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.income)}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-widest">Saídas</span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.expense)}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">Lucro</span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.income - monthlyTotals.expense)}</h4>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100"><h4 className="text-[10px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">Fechamento Mensal Sócios</h4></div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                              <th className="px-4 py-3">Sócio</th>
                              <th className="px-4 py-3">Ajuste (50/50)</th>
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
                                      <td className="px-4 py-3 flex items-center gap-3 font-bold text-slate-800 text-xs">
                                        <img src={u.avatar} className="w-6 h-6 rounded-full" /> {u.name}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                          <span className={`font-black text-[10px] ${diff <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
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
          <div className="bg-white p-3 md:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3 no-print">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selecionar Obra</label>
                <select 
                  value={selectedOSId} 
                  onChange={e => setSelectedOSId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="">Escolha a Obra...</option>
                  {serviceOrders.map(os => (
                    <option key={os.id} value={os.id}>{os.id} - {os.customerName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={handleWhatsAppShare}
                    disabled={!selectedOSId}
                    className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-4 h-4" /> Resumo
                </button>
                <button 
                    onClick={handleExportPDF} 
                    disabled={!selectedOSId} 
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Printer className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>

          {!selectedOSId && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 no-print">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Selecione uma obra acima</p>
            </div>
          )}

          {selectedOS && (
            <div className="animate-in fade-in duration-500 space-y-3 print:space-y-2">
              {/* Cabeçalho de Impressão Compacto */}
              <div className="hidden print:block border-b-2 border-slate-900 pb-1 mb-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none">JP FORRO</h1>
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">RELATÓRIO DE OBRA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600">{selectedOS.id}</p>
                    <p className="text-[7px] font-bold text-slate-400">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Informações Obra - Compacto */}
              <div className="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
                <div className="flex flex-col md:flex-row justify-between gap-3 items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{selectedOS.customerName}</h3>
                    <p className="text-slate-500 font-black flex items-center gap-2 text-[8px] uppercase mt-1">
                        <MapPin className="w-3 h-3 text-blue-500" /> {selectedOS.customerAddress}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                    <div className="p-2 bg-slate-900 text-white rounded-xl text-center">
                        <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">CONTRATO</p>
                        <p className="text-xs font-black">{formatCurrency(selectedOS.totalValue)}</p>
                    </div>
                    <div className="p-2 bg-blue-600 text-white rounded-xl text-center">
                        <p className="text-[6px] font-black text-blue-200 uppercase tracking-widest">LUCRO</p>
                        <p className="text-xs font-black">{formatCurrency(osProfit)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extrato Despesas - Compacto */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
                <div className="p-2 bg-slate-50/50 flex items-center gap-2 border-b">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  <h4 className="font-black text-slate-800 text-[8px] uppercase tracking-widest">Custos e Materiais</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-3 py-1.5">Data</th>
                        <th className="px-3 py-1.5">Sócio</th>
                        <th className="px-3 py-1.5">Descrição</th>
                        <th className="px-3 py-1.5 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {osTransactions.filter(t => t.type === 'EXPENSE').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => (
                        <tr key={t.id} className="text-[9px]">
                          <td className="px-3 py-1 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-3 py-1 font-black text-blue-600 uppercase text-[8px] tracking-tighter">{t.userName}</td>
                          <td className="px-3 py-1 font-medium text-slate-700">{t.description}</td>
                          <td className="px-3 py-1 text-right font-black text-rose-600">{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t">
                      <tr>
                        <td colSpan={3} className="px-3 py-1 text-right text-[7px] font-black uppercase">Subtotal Custos</td>
                        <td className="px-3 py-1 text-right text-xs font-black text-rose-600">{formatCurrency(osExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Divisão Ivo e Pedro - Compacto */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl break-inside-avoid print:bg-white print:text-black print:border print:border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Divisão Sociedade 50/50</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {users.map((u) => {
                      const uTrans = osTransactions.filter(t => t.userId === u.id);
                      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
                      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                      const finalBalance = (osProfit / 2) + uExp - uInc;

                      return (
                        <div key={u.id} className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2 print:border-slate-200 print:bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} className="w-8 h-8 rounded-full border border-blue-400" />
                              <h5 className="text-xs font-black uppercase">{u.name}</h5>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${finalBalance >= 0 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>
                                {finalBalance >= 0 ? 'Receber ' : 'Pagar '}
                                {formatCurrency(Math.abs(finalBalance))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-slate-400 uppercase pt-2 border-t border-white/5">
                            <span>Custos: {formatCurrency(uExp)}</span>
                            <span className="text-right">Receitas: {formatCurrency(uInc)}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="hidden print:grid grid-cols-2 gap-10 mt-6 px-4">
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-black text-[9px] text-slate-900">Ivo junior</p>
                </div>
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-black text-[9px] text-slate-900">Pedro Augusto</p>
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

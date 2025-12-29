
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Calendar, ArrowUpRight, ArrowDownRight, Printer, 
  Briefcase, User, Search, MapPin, Receipt, 
  Users, Scale, MessageCircle, FileText, Download 
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
    
    let message = `*PROPOSTA / FECHAMENTO JP FORRO*\n`;
    message += `*Obra:* ${selectedOS.customerName}\n`;
    message += `*OS:* ${selectedOS.id}\n`;
    message += `----------------------------\n`;
    message += `*Valor:* ${formatCurrency(selectedOS.totalValue)}\n`;
    message += `*Custos:* ${formatCurrency(osExpense)}\n`;
    message += `*Lucro:* ${formatCurrency(osProfit)}\n\n`;
    
    message += `*ACERTO DE SÓCIOS:*\n`;
    
    users.forEach(u => {
      const uTrans = osTransactions.filter(t => t.userId === u.id);
      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
      const share = (osProfit / 2);
      const finalBalance = share + uExp - uInc;
      
      message += `• *${u.name}:* ${finalBalance >= 0 ? 'Receber' : 'Pagar'} ${formatCurrency(Math.abs(finalBalance))}\n`;
    });
    
    message += `\n_Gerado em: ${new Date().toLocaleDateString()}_`;

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
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-10">
      {/* Menu Superior - Unificado */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm no-print">
        <button 
          onClick={() => setReportType('MONTHLY')}
          className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${reportType === 'MONTHLY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Relatório Mensal
        </button>
        <button 
          onClick={() => setReportType('OS')}
          className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${reportType === 'OS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Relatório por Obra
        </button>
      </div>

      {reportType === 'MONTHLY' ? (
        <>
          {/* Cabeçalho Relatório Mensal */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm md:text-lg font-bold text-slate-800">Fechamento Mensal</h3>
                    <p className="text-[10px] md:text-sm text-slate-500 font-medium">Competência: {months[month]} / {year}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[11px] font-bold">
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[11px] font-bold">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={handleExportPDF} className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-all">
                    <Printer className="w-4 h-4" />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[8px] md:text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Entradas</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.income)}</h4>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[8px] md:text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-widest">Saídas</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.expense)}</h4>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[8px] md:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">Saldo Líquido</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-2">{formatCurrency(monthlyTotals.income - monthlyTotals.expense)}</h4>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">Partilha de Resultados</h4>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                              <th className="px-4 py-4">Sócio</th>
                              <th className="px-4 py-4 text-right">Ajuste Final (50/50)</th>
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
                                      <td className="px-4 py-4 flex items-center gap-3 font-bold text-slate-800 text-xs md:text-sm">
                                        <img src={u.avatar} className="w-6 h-6 md:w-8 md:h-8 rounded-full" /> {u.name}
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                          <span className={`font-black text-[10px] md:text-xs ${diff <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
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
          {/* Cabeçalho Relatório OS - Unificado para Celular e Notebook */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 no-print">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selecionar Obra para Fechamento</label>
                <select 
                  value={selectedOSId} 
                  onChange={e => setSelectedOSId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button 
                    onClick={handleExportPDF} 
                    disabled={!selectedOSId} 
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>

          {!selectedOSId && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 no-print">
              <Search className="w-10 h-10 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] md:text-[10px]">Selecione uma obra para ver o detalhamento financeiro</p>
            </div>
          )}

          {selectedOS && (
            <div className="animate-in fade-in duration-500 space-y-4 print:space-y-4">
              {/* Layout do Relatório de Impressão */}
              <div className="hidden print:block border-b-4 border-slate-900 pb-2 mb-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-none">JP FORRO</h1>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">FECHAMENTO TÉCNICO E FINANCEIRO</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600">{selectedOS.id}</p>
                    <p className="text-[8px] font-bold text-slate-400">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Obra - Grid Unificado */}
              <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 break-inside-avoid">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-8 items-start">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">{selectedOS.customerName}</h3>
                    <p className="text-slate-500 font-black flex items-center gap-2 text-[9px] md:text-xs uppercase mt-2">
                        <MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl text-center">
                        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CONTRATO</p>
                        <p className="text-sm md:text-xl font-black">{formatCurrency(selectedOS.totalValue)}</p>
                    </div>
                    <div className="p-3 bg-blue-600 text-white rounded-2xl text-center">
                        <p className="text-[7px] md:text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1">LUCRO OBRA</p>
                        <p className="text-sm md:text-xl font-black">{formatCurrency(osProfit)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6 pt-6 border-t border-slate-50">
                    <div><p className="text-[7px] font-black text-slate-400 uppercase">Recebido</p><p className="text-xs md:text-base font-black text-emerald-600">{formatCurrency(osIncome)}</p></div>
                    <div><p className="text-[7px] font-black text-slate-400 uppercase">Custos</p><p className="text-xs md:text-base font-black text-rose-600">{formatCurrency(osExpense)}</p></div>
                    <div><p className="text-[7px] font-black text-slate-400 uppercase">Pendente</p><p className="text-xs md:text-base font-black text-amber-500">{formatCurrency(selectedOS.totalValue - osIncome)}</p></div>
                    <div><p className="text-[7px] font-black text-slate-400 uppercase">Margem</p><p className="text-xs md:text-base font-black text-blue-600">{((osProfit / (osIncome || 1)) * 100).toFixed(1)}%</p></div>
                </div>
              </div>

              {/* Detalhamento de Custos - Tabela */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
                <div className="p-3 md:p-4 bg-slate-50/50 flex items-center gap-2 border-b">
                  <Receipt className="w-4 h-4 text-rose-500" />
                  <h4 className="font-black text-slate-800 text-[9px] md:text-[10px] uppercase tracking-widest">Extrato de Despesas e Materiais</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Responsável</th>
                        <th className="px-4 py-2">Descrição</th>
                        <th className="px-4 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {osTransactions.filter(t => t.type === 'EXPENSE').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => (
                        <tr key={t.id} className="text-[9px] md:text-xs">
                          <td className="px-4 py-2 text-slate-400 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 font-black text-blue-600 uppercase text-[8px] md:text-[10px]">{t.userName}</td>
                          <td className="px-4 py-2 font-bold text-slate-700">{t.description}</td>
                          <td className="px-4 py-2 text-right font-black text-rose-600">{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t font-black">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-[8px] uppercase">Somatório de Custos</td>
                        <td className="px-4 py-2 text-right text-xs md:text-sm text-rose-600">{formatCurrency(osExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Divisão Financeira de Sócios - Ivo e Pedro */}
              <div className="bg-slate-900 rounded-[2rem] p-4 md:p-8 text-white shadow-2xl break-inside-avoid print:bg-white print:text-black print:border-2 print:border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-black uppercase tracking-tight">Divisão Sociedade 50/50</h3>
                      <p className="text-blue-300 text-[8px] md:text-[10px] uppercase font-black tracking-widest">Resultados Nominais Ivo e Pedro</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((u) => {
                      const uTrans = osTransactions.filter(t => t.userId === u.id);
                      const uInc = uTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
                      const uExp = uTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                      const share = osProfit / 2;
                      const finalBalance = share + uExp - uInc;

                      return (
                        <div key={u.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} className="w-10 h-10 rounded-full border border-blue-400" />
                              <div>
                                <span className="text-[7px] md:text-[8px] font-black text-blue-400 uppercase">Sócio</span>
                                <h5 className="text-xs md:text-sm font-black uppercase tracking-tight">{u.name}</h5>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[7px] font-black text-slate-500 uppercase">Sua Parte</span>
                              <p className="text-xs font-black text-blue-400">{formatCurrency(share)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 print:border-slate-200 text-[8px] md:text-[9px] font-bold uppercase">
                            <div className="text-rose-400">Gastou: {formatCurrency(uExp)}</div>
                            <div className="text-emerald-400 text-right">Retirou: {formatCurrency(uInc)}</div>
                          </div>

                          <div className={`p-3 rounded-xl flex justify-between items-center ${finalBalance >= 0 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'} border border-current print:bg-white`}>
                            <span className="text-[8px] font-black uppercase tracking-widest">{finalBalance >= 0 ? 'A Receber' : 'A Pagar'}</span>
                            <span className="text-sm md:text-lg font-black">{formatCurrency(Math.abs(finalBalance))}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Descrição e Assinaturas */}
              <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-100 break-inside-avoid">
                <h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resumo do Serviço Prestado
                </h4>
                <p className="text-slate-700 font-bold text-xs md:text-sm leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
                  "{selectedOS.description}"
                </p>
              </div>

              <div className="hidden print:grid grid-cols-2 gap-10 mt-12 px-10">
                <div className="border-t border-slate-400 pt-2 text-center">
                  <p className="font-black text-xs text-slate-900">Ivo junior</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold">Responsável Técnico</p>
                </div>
                <div className="border-t border-slate-400 pt-2 text-center">
                  <p className="font-black text-xs text-slate-900">Pedro Augusto</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold">Responsável Administrativo</p>
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

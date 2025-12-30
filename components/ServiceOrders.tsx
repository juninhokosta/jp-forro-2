
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus, ServiceOrder } from '../types';
import { 
  CheckCircle2, Clock, X, ClipboardList, MapPin, Fuel, ShoppingCart, 
  ChevronRight, PlusCircle, Scale, CheckCheck, Receipt, Users, Utensils, Coffee,
  Sparkles
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { 
    serviceOrders, 
    updateOSStatus, 
    addTransaction, 
    transactions,
    deleteOS
  } = useApp();

  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

  const [quickInput, setQuickInput] = useState<{
    show: boolean;
    category: string;
    osId: string;
    type: 'INCOME' | 'EXPENSE';
    value: string;
    notes: string;
    isCustom: boolean;
  }>({
    show: false,
    category: '',
    osId: '',
    type: 'EXPENSE',
    value: '',
    notes: '',
    isCustom: false
  });

  const selectedOS = serviceOrders.find(os => os.id === selectedOSId);
  const osTransactions = transactions.filter(t => t.osId === selectedOSId);
  const totalIncome = osTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = osTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const remainingBalance = selectedOS ? selectedOS.totalValue - totalIncome : 0;
  const isFinished = selectedOS ? (selectedOS.status === OSStatus.FINISHED || selectedOS.status === OSStatus.PAID) : false;

  const handleQuitarObra = () => {
    if (!selectedOS) return;
    if (remainingBalance <= 0) {
      alert("Obra já está totalmente quitada.");
      updateOSStatus(selectedOS.id, OSStatus.PAID);
      return;
    }

    if (confirm(`REGISTRAR QUITAÇÃO: Receber o valor final de ${formatCurrency(remainingBalance)}?`)) {
      addTransaction({
        type: 'INCOME',
        amount: remainingBalance,
        description: `Quitação Total - OS ${selectedOS.id}`,
        category: 'Faturamento de Obra',
        date: new Date().toISOString().split('T')[0],
        osId: selectedOS.id,
        notes: 'Pagamento total da obra recebido via quitação.'
      });
      updateOSStatus(selectedOS.id, OSStatus.PAID);
      alert("Obra quitada e faturada com sucesso!");
    }
  };

  const openQuickInput = (osId: string, category: string, isCustom = false) => {
    setQuickInput({ show: true, category, osId, type: 'EXPENSE', value: '', notes: '', isCustom });
  };

  const generateRandomValue = () => {
    const val = (Math.random() * (200 - 10) + 10).toFixed(2);
    setQuickInput(prev => ({ ...prev, value: val }));
  };

  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickInput.value);
    if (!isNaN(val)) {
      addTransaction({
        type: quickInput.type,
        amount: val,
        description: `${quickInput.isCustom ? quickInput.notes : quickInput.category} - OS ${quickInput.osId}`,
        category: quickInput.category,
        date: new Date().toISOString().split('T')[0],
        osId: quickInput.osId,
        notes: quickInput.notes
      });
      setQuickInput({ ...quickInput, show: false, value: '', notes: '', isCustom: false });
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (view === 'DETAIL' && selectedOS) {
    const profit = totalIncome - totalExpense;
    const isPaid = selectedOS.status === OSStatus.PAID;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-32">
        {quickInput.show && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleQuickInputSubmit} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black text-slate-800">{quickInput.isCustom ? 'Lançamento Avulso' : quickInput.category}</h4>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })}><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              {quickInput.isCustom && (
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">O que é este serviço/produto?</p>
                  <input 
                    type="text" required
                    value={quickInput.notes}
                    onChange={e => setQuickInput({ ...quickInput, notes: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold outline-none mb-2 focus:border-blue-500"
                    placeholder="Ex: Aluguel de Escada, Taxa Extra..."
                  />
                </div>
              )}

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor do Lançamento</p>
                  <button type="button" onClick={generateRandomValue} className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-1 hover:text-blue-700">
                    <Sparkles className="w-3 h-3" /> Valor Sugerido
                  </button>
                </div>
                <input 
                  type="number" step="0.01" autoFocus required 
                  value={quickInput.value} 
                  onChange={e => setQuickInput({ ...quickInput, value: e.target.value })}
                  className="w-full px-6 py-5 bg-slate-50 border-2 rounded-3xl text-3xl font-black outline-none focus:border-blue-500" 
                  placeholder="0,00" 
                />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Confirmar Lançamento</button>
            </form>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button onClick={() => setView('LIST')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 shadow-sm active:scale-95 transition-all">
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para Obras
          </button>
          <span className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border shadow-sm ${selectedOS.status === OSStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            {selectedOS.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border shadow-sm relative overflow-hidden">
              <div className="mb-10">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">{selectedOS.customerName}</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase flex items-center gap-2 mt-4">
                  <MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CONTRATO</p>
                  <p className="text-2xl font-black tracking-tight">{formatCurrency(selectedOS.totalValue)}</p>
                </div>
                <div className="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl">
                  <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest mb-1">RECEBIDO</p>
                  <p className="text-2xl font-black tracking-tight">{formatCurrency(totalIncome)}</p>
                </div>
                <div className={`p-6 rounded-[2rem] shadow-xl ${remainingBalance > 0 ? 'bg-amber-500' : 'bg-slate-200'} text-white`}>
                  <p className="text-[8px] font-black opacity-70 uppercase tracking-widest mb-1">PENDENTE</p>
                  <p className="text-2xl font-black tracking-tight">{formatCurrency(remainingBalance)}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-200 mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-500" /> LANÇAR CUSTOS DA OBRA
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    { label: 'Gasolina', icon: Fuel, color: 'amber', cat: 'Combustível' },
                    { label: 'Material', icon: ShoppingCart, color: 'blue', cat: 'Material' },
                    { label: 'Equipe', icon: Users, color: 'emerald', cat: 'Mão de Obra' },
                    { label: 'Almoço', icon: Utensils, color: 'rose', cat: 'Alimentação' },
                    { label: 'Lanche', icon: Coffee, color: 'orange', cat: 'Alimentação' },
                    { label: 'Avulso', icon: PlusCircle, color: 'slate', cat: 'Extra', isCustom: true },
                  ].map((btn, i) => (
                    <button 
                      key={i} onClick={() => openQuickInput(selectedOS.id, btn.cat, btn.isCustom)} 
                      className="flex flex-col items-center p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group"
                    >
                      <div className={`p-3 bg-${btn.color}-50 text-${btn.color}-500 rounded-2xl group-hover:bg-${btn.color}-500 group-hover:text-white transition-colors mb-3`}>
                        <btn.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-600">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 p-8 md:p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                <div className="text-center md:text-left z-10">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2 uppercase">Quitação e Faturamento</h3>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">Registrar o lucro real da obra</p>
                </div>
                <button 
                  onClick={handleQuitarObra} disabled={isPaid}
                  className="w-full md:w-auto px-10 py-5 bg-white text-blue-600 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 z-10"
                >
                  <CheckCheck className="w-5 h-5" /> {isPaid ? "OBRA QUITADA" : "QUITAR E FATURAR"}
                </button>
              </div>

              {isFinished && (
                <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="bg-slate-900 p-10 md:p-16 rounded-[3.5rem] text-white shadow-2xl border border-white/10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-blue-500 rounded-3xl shadow-xl"><Scale className="w-10 h-10" /></div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">Relatório de Divisão</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Partilha de Lucro 50/50</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">LUCRO LÍQUIDO</p>
                        <p className="text-4xl font-black tracking-tighter text-emerald-400">{formatCurrency(profit)}</p>
                      </div>
                      <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">P/ CADA SÓCIO</p>
                        <p className="text-4xl font-black tracking-tighter">{formatCurrency(profit / 2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">STATUS DA EXECUÇÃO</h4>
               <div className="space-y-3">
                  {Object.values(OSStatus).map((s) => (
                    <button 
                        key={s} 
                        onClick={() => updateOSStatus(selectedOS.id, s)} 
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedOS.status === s ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                        {selectedOS.status === s && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={() => { if(confirm('Excluir esta OS permanentemente?')) { deleteOS(selectedOS.id); setView('LIST'); } }}
              className="w-full p-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all border border-rose-100"
            >
              Excluir Registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Minhas Obras</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Acompanhamento de Lucros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {serviceOrders.map(os => (
          <div 
            key={os.id} 
            onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="p-8">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{os.id}</span>
                   <h4 className="text-2xl font-black text-slate-900 mt-3 truncate leading-none tracking-tight">{os.customerName}</h4>
                 </div>
                 <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 ml-4 shadow-sm ${os.status === OSStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500'}`}>{os.status}</span>
               </div>
               
               <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Obra</span>
                 <span className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(os.totalValue)}</span>
               </div>

               <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                   <div className={`h-full transition-all duration-1000 ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} />
               </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(os.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">VER DETALHES <ChevronRight className="w-4 h-4" /></div>
            </div>
          </div>
        ))}
        {serviceOrders.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <ClipboardList className="w-16 h-16 text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Nenhuma obra no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOrders;

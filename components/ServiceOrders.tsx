
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus, ServiceOrder } from '../types';
import { 
  CheckCircle2, Clock, X, ClipboardList, MapPin, Phone, Fuel, ShoppingCart, 
  ChevronRight, Edit3, PlusCircle, Scale, Archive, CheckCheck, CreditCard, Receipt, Users
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { 
    serviceOrders, 
    updateOSStatus, 
    addTransaction, 
    transactions,
    archiveOS,
    deleteOS
  } = useApp();

  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [quickInput, setQuickInput] = useState<{
    show: boolean;
    category: string;
    osId: string;
    type: 'INCOME' | 'EXPENSE';
    value: string;
    notes: string;
  }>({
    show: false,
    category: '',
    osId: '',
    type: 'EXPENSE',
    value: '',
    notes: ''
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

  const openQuickInput = (osId: string, category: string, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    setQuickInput({ show: true, category, osId, type, value: '', notes: '' });
  };

  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickInput.value);
    if (!isNaN(val)) {
      addTransaction({
        type: quickInput.type,
        amount: val,
        description: `${quickInput.category} - OS ${quickInput.osId}`,
        category: quickInput.category,
        date: new Date().toISOString().split('T')[0],
        osId: quickInput.osId,
        notes: quickInput.notes
      });
      setQuickInput({ ...quickInput, show: false, value: '' });
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
                <h4 className="text-xl font-black text-slate-800">{quickInput.category}</h4>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor do Lançamento</p>
              <input 
                type="number" step="0.01" autoFocus required 
                value={quickInput.value} 
                onChange={e => setQuickInput({ ...quickInput, value: e.target.value })}
                className="w-full px-6 py-5 bg-slate-50 border-2 rounded-3xl text-3xl font-black outline-none mb-6 focus:border-blue-500" 
                placeholder="0,00" 
              />
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Confirmar Lançamento</button>
            </form>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button onClick={() => setView('LIST')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 shadow-sm active:scale-95">
            <X className="w-4 h-4" /> Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={() => { archiveOS(selectedOS.id, !selectedOS.archived); setView('LIST'); }} className="px-4 py-3 bg-white border rounded-2xl text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
              <Archive className="w-4 h-4" /> {selectedOS.archived ? "Restaurar" : "Arquivar"}
            </button>
            <span className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border shadow-sm ${selectedOS.status === OSStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              {selectedOS.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border shadow-sm relative overflow-hidden">
              <div className="mb-10">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">{selectedOS.customerName}</h2>
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">VALOR CONTRATO</p>
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
                  <Receipt className="w-4 h-4 text-blue-500" /> LANÇAR CUSTOS RÁPIDOS NA OBRA
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => openQuickInput(selectedOS.id, 'Combustível')} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group">
                    <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors mb-4">
                      <Fuel className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Gasolina</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Material')} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors mb-4">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Material</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Mão de Obra')} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group">
                    <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Equipe</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Outros')} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group">
                    <div className="p-4 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-slate-400 group-hover:text-white transition-colors mb-4">
                      <PlusCircle className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Outros</span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-600 p-8 md:p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                <div className="text-center md:text-left z-10">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2 uppercase">Quitação e Fechamento</h3>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">Registrar faturamento total da obra</p>
                </div>
                <button 
                  onClick={handleQuitarObra}
                  disabled={isPaid}
                  className="w-full md:w-auto px-10 py-5 bg-white text-blue-600 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 z-10"
                >
                  <CheckCheck className="w-5 h-5" /> {isPaid ? "OBRA QUITADA" : "QUITAR SALDO AGORA"}
                </button>
              </div>

              {isFinished && (
                <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="bg-slate-900 p-10 md:p-16 rounded-[3.5rem] text-white shadow-2xl border border-white/10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-blue-500 rounded-3xl shadow-xl"><Scale className="w-10 h-10" /></div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">Partilha Sociedade</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Lucro Líquido 50/50</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">LUCRO TOTAL DA OBRA</p>
                        <p className="text-4xl font-black tracking-tighter text-emerald-400">{formatCurrency(profit)}</p>
                      </div>
                      <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">PARTE DE CADA SÓCIO</p>
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

            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">OPÇÕES</h4>
              <button 
                onClick={() => { if(confirm('Excluir esta OS permanentemente?')) { deleteOS(selectedOS.id); setView('LIST'); } }}
                className="w-full p-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
              >
                Excluir Registro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOS = serviceOrders.filter(os => showArchived ? os.archived : !os.archived);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{showArchived ? 'Histórico de Obras' : 'Obras em Aberto'}</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de {filteredOS.length} registros</p>
        </div>
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border shadow-lg ${showArchived ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          <Archive className="w-5 h-5" /> {showArchived ? 'Ativas' : 'Arquivo'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredOS.map(os => (
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
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato</span>
                 <span className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(os.totalValue)}</span>
               </div>

               <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                   <div className={`h-full transition-all duration-1000 ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} />
               </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(os.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">DETALHES <ChevronRight className="w-4 h-4" /></div>
            </div>
          </div>
        ))}
        {filteredOS.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <ClipboardList className="w-16 h-16 text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Nenhuma obra cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOrders;

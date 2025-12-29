
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus, ServiceOrder } from '../types';
import { 
  CheckCircle2, Clock, DollarSign, User, 
  Settings, X, ClipboardList, MapPin, Phone, Fuel, ShoppingCart, 
  Utensils, Coffee, ChevronRight, Edit3,
  ArrowRight, Calculator, Soup, PlusCircle, Edit, Trash2, Info,
  TrendingUp, Users, Scale, Archive, CheckCheck, CreditCard
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { 
    serviceOrders, 
    updateOS, 
    deleteOS,
    archiveOS,
    updateOSStatus, 
    addTransaction, 
    transactions,
    users
  } = useApp();

  const [view, setView] = useState<'LIST' | 'DETAIL' | 'EDIT'>('LIST');
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

  const [editOS, setEditOS] = useState({ 
    customerName: '', 
    customerContact: '', 
    customerAddress: '',
    description: '',
    additionalInfo: '',
    expectedDate: '',
    totalValue: ''
  });

  const selectedOS = serviceOrders.find(os => os.id === selectedOSId);
  const osTransactions = transactions.filter(t => t.osId === selectedOSId);
  const totalIncome = osTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = osTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const remainingBalance = selectedOS ? selectedOS.totalValue - totalIncome : 0;
  const isFinished = selectedOS ? (selectedOS.status === OSStatus.FINISHED || selectedOS.status === OSStatus.PAID) : false;

  const handleUpdateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOSId || !editOS.customerName) return;
    updateOS(selectedOSId, {
      customerName: editOS.customerName,
      customerContact: editOS.customerContact,
      customerAddress: editOS.customerAddress,
      description: editOS.description,
      totalValue: parseFloat(editOS.totalValue) || 0,
      expectedDate: editOS.expectedDate
    });
    setView('DETAIL');
  };

  const handleDeleteOS = () => {
    if (!selectedOSId) return;
    if (confirm('Excluir permanentemente?')) {
      deleteOS(selectedOSId);
      setView('LIST');
      setSelectedOSId(null);
    }
  };

  const handleArchive = () => {
    if (!selectedOSId) return;
    const currentArchived = selectedOS?.archived || false;
    archiveOS(selectedOSId, !currentArchived);
    alert(currentArchived ? "Obra restaurada para lista ativa!" : "Obra arquivada com sucesso!");
    setView('LIST');
  };

  const handleQuitarObra = () => {
    if (!selectedOS) return;
    if (remainingBalance <= 0) {
      alert("Esta obra já está totalmente paga.");
      updateOSStatus(selectedOS.id, OSStatus.PAID);
      return;
    }

    if (confirm(`Deseja quitar o saldo de ${formatCurrency(remainingBalance)} e faturar esta obra?`)) {
      addTransaction({
        type: 'INCOME',
        amount: remainingBalance,
        description: `Quitação Final / Faturamento - OS ${selectedOS.id}`,
        category: 'Faturamento de Obra',
        date: new Date().toISOString().split('T')[0],
        osId: selectedOS.id,
        notes: 'Pagamento total recebido. Serviço concluído e faturado.'
      });
      updateOSStatus(selectedOS.id, OSStatus.PAID);
      alert("Obra quitada e faturada com sucesso!");
    }
  };

  const handleFinishOS = (id: string) => {
    updateOSStatus(id, OSStatus.FINISHED);
    alert("Serviço marcado como concluído!");
  };

  const handleStartEdit = (os: ServiceOrder) => {
    setEditOS({
      customerName: os.customerName,
      customerContact: os.customerContact || '',
      customerAddress: os.customerAddress || '',
      description: os.description,
      additionalInfo: os.additionalInfo || '',
      expectedDate: os.expectedDate || new Date().toISOString().split('T')[0],
      totalValue: os.totalValue.toString()
    });
    setSelectedOSId(os.id);
    setView('EDIT');
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
      setQuickInput({ ...quickInput, show: false, notes: '' });
    }
  };

  const getStatusColor = (status: OSStatus) => {
    switch (status) {
        case OSStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case OSStatus.FINISHED: return 'bg-blue-100 text-blue-700 border-blue-200';
        case OSStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (view === 'EDIT') {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-300 pb-32">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-amber-500 p-6 md:p-8 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-black">Editar Obra</h3>
              <p className="text-white/80 text-[10px] uppercase tracking-widest font-black">CÓDIGO {selectedOSId}</p>
            </div>
            <button onClick={() => setView('DETAIL')} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleUpdateOS} className="p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</label>
                <input type="text" required value={editOS.customerName} onChange={e => setEditOS({...editOS, customerName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Contrato</label>
                <input type="number" step="0.01" required value={editOS.totalValue} onChange={e => setEditOS({...editOS, totalValue: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-blue-600" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhamento</label>
                <textarea required value={editOS.description} onChange={e => setEditOS({...editOS, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px]" />
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <button type="button" onClick={handleDeleteOS} className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-6 py-4 rounded-2xl transition-all">Excluir Registro</button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setView('DETAIL')} className="px-8 py-4 font-black text-slate-400 uppercase text-[10px]">Sair</button>
                <button type="submit" className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95">Salvar Alterações</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'DETAIL' && selectedOS) {
    const profit = totalIncome - totalExpense;
    const isPaid = selectedOS.status === OSStatus.PAID;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-32">
        {quickInput.show && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleQuickInputSubmit} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-black text-slate-900">{quickInput.category}</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Registrar Lançamento</p>
                </div>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</label>
                   <input type="number" step="0.01" required value={quickInput.value} onChange={e => setQuickInput({ ...quickInput, value: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-3xl outline-none focus:border-blue-500" placeholder="0,00" />
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95">Confirmar Registro</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-black uppercase text-[10px] tracking-widest">
            <X className="w-5 h-5" /> Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={handleArchive} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black uppercase border shadow-sm flex items-center gap-1 hover:bg-slate-100">
              <Archive className="w-3.5 h-3.5" /> {selectedOS.archived ? "Restaurar" : "Arquivar OS"}
            </button>
            <button onClick={() => handleStartEdit(selectedOS)} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black uppercase border shadow-sm flex items-center gap-1 hover:bg-slate-100">
              <Edit3 className="w-3.5 h-3.5" /> Editar
            </button>
            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getStatusColor(selectedOS.status)}`}>{selectedOS.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">{selectedOS.customerName}</h2>
                  <div className="flex flex-col gap-2 mt-4 text-[10px] md:text-xs font-black uppercase text-slate-500">
                    <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}</p>
                    <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-500" /> {selectedOS.customerContact}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CÓDIGO OS</p>
                  <p className="font-mono font-black text-blue-600">{selectedOS.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="p-6 bg-slate-900 text-white rounded-[2rem]">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">CONTRATO</p>
                      <p className="text-xl font-black tracking-tighter">{formatCurrency(selectedOS.totalValue)}</p>
                  </div>
                  <div className="p-6 bg-emerald-600 text-white rounded-[2rem]">
                      <p className="text-[8px] font-black text-emerald-200 uppercase tracking-widest mb-2">RECEBIDO</p>
                      <p className="text-xl font-black tracking-tighter">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="p-6 bg-amber-500 text-white rounded-[2rem]">
                      <p className="text-[8px] font-black text-amber-100 uppercase tracking-widest mb-2">PENDENTE</p>
                      <p className="text-xl font-black tracking-tighter">{formatCurrency(remainingBalance)}</p>
                  </div>
              </div>

              <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl"><CheckCheck className="w-8 h-8" /></div>
                    <div>
                       <h3 className="text-xl font-black tracking-tight">Finalização da Obra</h3>
                       <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Controle de Faturamento</p>
                    </div>
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={handleQuitarObra}
                      disabled={isPaid}
                      className="flex-1 md:flex-none px-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" /> {isPaid ? "QUITADO" : "QUITAR E FATURAR"}
                    </button>
                    {!isFinished && (
                      <button 
                        onClick={() => handleFinishOS(selectedOS.id)}
                        className="flex-1 md:flex-none px-6 py-4 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> CONCLUIR SERVIÇO
                      </button>
                    )}
                 </div>
              </div>

              <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2"><ClipboardList className="w-4 h-4" /> DESCRIÇÃO</h4>
                  <p className="text-slate-700 font-bold text-sm md:text-lg leading-relaxed italic">"{selectedOS.description}"</p>
              </div>

              {isFinished && (
                <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl">
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl"><Scale className="w-8 h-8" /></div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight">Resultados da Sociedade</h3>
                          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Distribuição Livre de Impostos</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">LUCRO LÍQUIDO TOTAL</p>
                          <p className="text-4xl font-black tracking-tighter">{formatCurrency(profit)}</p>
                        </div>
                        <div className="bg-blue-600 p-6 rounded-[2rem] flex flex-col justify-center">
                          <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">CADA SÓCIO (50%)</p>
                          <p className="text-3xl font-black tracking-tighter">{formatCurrency(profit / 2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">LANÇAMENTOS NA OBRA</h4>
               <div className="grid grid-cols-2 gap-3 mb-8">
                  <button onClick={() => openQuickInput(selectedOS.id, 'Combustível')} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <Fuel className="w-6 h-6 text-amber-500 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-600">Combustível</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Material')} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <ShoppingCart className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-600">Material</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Mão de Obra')} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <Users className="w-6 h-6 text-emerald-500 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-600">Mão de Obra</span>
                  </button>
                  <button onClick={() => openQuickInput(selectedOS.id, 'Outros')} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <PlusCircle className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-[9px] font-black uppercase text-slate-600">Outros</span>
                  </button>
               </div>
               <button onClick={() => openQuickInput(selectedOS.id, 'Recebimento Parcial', 'INCOME')} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  Registrar Pagamento
               </button>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">PROGRESSO</h4>
               <div className="space-y-3">
                  {Object.values(OSStatus).map((s) => (
                    <button 
                        key={s} 
                        onClick={() => updateOSStatus(selectedOS.id, s)} 
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedOS.status === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                    >
                        <span className="text-[10px] font-black uppercase">{s}</span>
                        {selectedOS.status === s && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOS = serviceOrders.filter(os => showArchived ? os.archived : !os.archived);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ordens de Serviço</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Gestão de {showArchived ? 'Obras Arquivadas' : 'Obras em Andamento'}</p>
        </div>
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${showArchived ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          <Archive className="w-4 h-4" /> {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOS.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <ClipboardList className="w-16 h-16 text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhuma obra {showArchived ? 'arquivada' : 'em andamento'}</p>
          </div>
        )}
        {filteredOS.map(os => (
          <div 
            key={os.id} 
            onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }} 
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 md:p-8">
               <div className="flex justify-between items-start mb-6">
                 <div className="space-y-1 min-w-0 flex-1">
                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{os.id}</span>
                   <h4 className="text-xl font-black text-slate-900 mt-2 truncate leading-tight">{os.customerName}</h4>
                 </div>
                 <span className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase border shrink-0 ml-3 shadow-sm ${getStatusColor(os.status)}`}>{os.status}</span>
               </div>
               
               <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Contrato</span>
                   <span className="text-base font-black text-slate-900">{formatCurrency(os.totalValue)}</span>
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Progresso</span>
                   <span className="text-blue-600">{os.progress}%</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                   <div className={`h-full transition-all duration-1000 rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} />
                 </div>
               </div>
            </div>
            
            <div className="px-6 md:px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 truncate"><Clock className="w-4 h-4" /> {new Date(os.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1.5 text-blue-600 font-black">
                 VER DETALHES <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;

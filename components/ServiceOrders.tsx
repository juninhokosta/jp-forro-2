
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus, ServiceOrder } from '../types';
import { 
  CheckCircle2, Clock, DollarSign, User, 
  Settings, X, ClipboardList, MapPin, Phone, Fuel, ShoppingCart, 
  Utensils, Coffee, ChevronRight, Edit3,
  ArrowRight, Calculator, Soup, PlusCircle, Edit, Trash2, Info,
  TrendingUp, Users, Scale
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { 
    serviceOrders, 
    updateOS, 
    deleteOS,
    updateOSStatus, 
    addTransaction, 
    transactions,
    users
  } = useApp();

  const [view, setView] = useState<'LIST' | 'DETAIL' | 'EDIT'>('LIST');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

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
    if (confirm('Tem certeza que deseja excluir permanentemente esta Ordem de Serviço? Esta ação não pode ser desfeita.')) {
      deleteOS(selectedOSId);
      setView('LIST');
      setSelectedOSId(null);
    }
  };

  const handleFinishOS = (id: string) => {
    updateOSStatus(id, OSStatus.FINISHED);
    alert("Obra Finalizada!");
    setView('DETAIL'); // Mantém no detalhe para ver o fechamento
  };

  const handleStartEdit = (os: ServiceOrder) => {
    setEditOS({
      customerName: os.customerName,
      // Fix: Use customerContact instead of contact to match ServiceOrder type definition
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

  const selectedOS = serviceOrders.find(os => os.id === selectedOSId);
  const osTransactions = transactions.filter(t => t.osId === selectedOSId);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (view === 'EDIT') {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-300 pb-32">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-amber-500 p-6 md:p-8 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-black">Editar Obra</h3>
              <p className="text-white/80 text-[10px] md:text-sm uppercase tracking-widest font-black">CÓDIGO {selectedOSId}</p>
            </div>
            <button onClick={() => setView('DETAIL')} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleUpdateOS} className="p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Cliente</label>
                <input type="text" required value={editOS.customerName} onChange={e => setEditOS({...editOS, customerName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Nome" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-3 h-3" /> Valor Contrato</label>
                <input type="number" step="0.01" required value={editOS.totalValue} onChange={e => setEditOS({...editOS, totalValue: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-black text-blue-600" placeholder="0,00" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> WhatsApp</label>
                <input type="text" value={editOS.customerContact} onChange={e => setEditOS({...editOS, customerContact: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Previsão Entrega</label>
                <input type="date" value={editOS.expectedDate} onChange={e => setEditOS({...editOS, expectedDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Endereço da Obra</label>
                <input type="text" value={editOS.customerAddress} onChange={e => setEditOS({...editOS, customerAddress: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Logradouro, Nº, Bairro" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-3 h-3" /> Detalhamento</label>
                <textarea required value={editOS.description} onChange={e => setEditOS({...editOS, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px] font-medium" placeholder="Descreva os serviços e produtos..." />
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <button 
                type="button" 
                onClick={handleDeleteOS} 
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" /> Excluir Obra Permanentemente
              </button>
              <div className="flex gap-3 w-full md:w-auto">
                <button type="button" onClick={() => setView('DETAIL')} className="flex-1 md:flex-none px-8 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Sair</button>
                <button type="submit" className="flex-1 md:flex-none px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'DETAIL' && selectedOS) {
    const totalIncome = osTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = osTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const remainingBalance = selectedOS.totalValue - totalIncome;
    const profit = totalIncome - totalExpense;
    const isFinished = selectedOS.status === OSStatus.FINISHED || selectedOS.status === OSStatus.PAID;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-32 md:pb-10">
        {quickInput.show && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleQuickInputSubmit} className="bg-white rounded-[2.5rem] p-8 w-full max-md shadow-2xl border border-slate-100 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{quickInput.category}</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Registrar Lançamento Financeiro</p>
                </div>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Lançamento</label>
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300">R$</span>
                      <input autoFocus type="number" step="0.01" required value={quickInput.value} onChange={e => setQuickInput({ ...quickInput, value: e.target.value })} className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-black text-3xl text-slate-800 transition-all" placeholder="0,00" />
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Opcional</label>
                  <textarea 
                    value={quickInput.notes} 
                    onChange={e => setQuickInput({ ...quickInput, notes: e.target.value })}
                    placeholder="Ex: Pagamento parcelado, material extra..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] font-medium"
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">Confirmar Registro <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-black uppercase text-[10px] tracking-widest p-2">
            <X className="w-5 h-5" /> Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleStartEdit(selectedOS)} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black uppercase border shadow-sm flex items-center gap-1 hover:bg-slate-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Editar Obra
            </button>
            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getStatusColor(selectedOS.status)}`}>{selectedOS.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                <div className="max-w-full min-w-0">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter truncate leading-tight">{selectedOS.customerName}</h2>
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="text-slate-500 font-black flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-tight truncate"><MapPin className="w-4 h-4 text-blue-500 shrink-0" /> {selectedOS.customerAddress}</p>
                    <p className="text-slate-500 font-black flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-tight truncate"><Phone className="w-4 h-4 text-blue-500 shrink-0" /> {selectedOS.customerContact}</p>
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">IDENTIFICADOR OS</p>
                  <p className="font-mono font-black text-blue-600 text-sm md:text-lg">{selectedOS.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">CONTRATO</p>
                      <p className="text-xl md:text-2xl font-black truncate tracking-tighter">{formatCurrency(selectedOS.totalValue)}</p>
                  </div>
                  <div className="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl">
                      <p className="text-[8px] font-black text-emerald-200 uppercase tracking-widest mb-2">RECEBIDO</p>
                      <p className="text-xl md:text-2xl font-black truncate tracking-tighter">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="p-6 bg-amber-500 text-white rounded-[2rem] shadow-xl">
                      <p className="text-[8px] font-black text-amber-100 uppercase tracking-widest mb-2">PENDENTE</p>
                      <p className="text-xl md:text-2xl font-black truncate tracking-tighter">{formatCurrency(remainingBalance)}</p>
                  </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-rose-500 shrink-0"><Calculator className="w-8 h-8" /></div>
                  <div>
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">TOTAL DE GASTOS</h4>
                    <p className="text-3xl md:text-5xl font-black text-rose-600 tracking-tighter truncate">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
                <div className="text-left md:text-right border-t md:border-t-0 pt-6 md:pt-0 w-full md:w-auto">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">SALDO ATUAL DA OBRA</span>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(totalIncome - totalExpense)}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2"><ClipboardList className="w-4 h-4" /> DESCRIÇÃO DOS SERVIÇOS</h4>
                  <p className="text-slate-700 font-bold text-sm md:text-lg leading-relaxed italic">"{selectedOS.description}"</p>
              </div>

              {/* NOVA SEÇÃO: DETALHES DE FECHAMENTO E LUCRO PARA SÓCIOS */}
              {isFinished && (
                <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-blue-600 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-48 h-48" />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight">Fechamento de Obra</h3>
                          <p className="text-blue-100 text-[10px] uppercase font-black tracking-widest">Resumo Consolidado para Sócios</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10">
                          <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-2">LUCRO LÍQUIDO TOTAL</p>
                          <p className="text-4xl font-black tracking-tighter">{formatCurrency(profit)}</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 flex items-center gap-5">
                          <div className="p-4 bg-blue-500/30 rounded-2xl">
                             <Scale className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">DIVISÃO POR SÓCIO</p>
                            <p className="text-3xl font-black tracking-tighter">{formatCurrency(profit / 2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <Users className="w-4 h-4" /> DISPONÍVEL PARA RETIRADA
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {users.map((u, i) => (
                            <div key={u.id} className="flex flex-col items-center bg-white p-4 rounded-3xl text-slate-900 shadow-xl">
                               <img src={u.avatar} className="w-12 h-12 rounded-full border-2 border-blue-100 mb-3" alt={u.name} />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{u.name}</span>
                               <span className="text-lg font-black text-blue-600 mt-1">{formatCurrency(profit / 2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col md:flex-row gap-4 no-print">
                      <button 
                        onClick={() => window.print()}
                        className="flex-1 bg-white border-2 border-slate-200 p-4 rounded-2xl font-black text-slate-600 text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                      >
                         Gerar Relatório Final (PDF)
                      </button>
                      <button 
                        onClick={() => updateOSStatus(selectedOS.id, OSStatus.PAID)}
                        disabled={selectedOS.status === OSStatus.PAID}
                        className="flex-1 bg-emerald-600 p-4 rounded-2xl font-black text-white text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                         {selectedOS.status === OSStatus.PAID ? "Obra Quitada ✅" : "Marcar como Pago 💰"}
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8 no-print">
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2"><Settings className="w-4 h-4" /> LANÇAMENTOS RÁPIDOS</h4>
              
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
                {[
                    { cat: 'Combustível', icon: Fuel, color: 'text-amber-400', label: 'GAS' },
                    { cat: 'Material', icon: ShoppingCart, color: 'text-blue-400', label: 'MAT' },
                    { cat: 'Almoço', icon: Utensils, color: 'text-emerald-400', label: 'ALM' },
                    { cat: 'Lanche', icon: Coffee, color: 'text-orange-400', label: 'LAN' },
                    { cat: 'Jantar', icon: Soup, color: 'text-indigo-400', label: 'JAN' },
                    { cat: 'Outros', icon: PlusCircle, color: 'text-slate-400', label: 'EXT' }
                ].map((item) => (
                    <button 
                        key={item.cat}
                        onClick={() => openQuickInput(selectedOS.id, item.cat)} 
                        className="flex flex-col items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group active:scale-95 transition-all hover:bg-white/10"
                    >
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{item.label}</span>
                    </button>
                ))}
              </div>

              <div className="space-y-4">
                <button onClick={() => openQuickInput(selectedOS.id, 'Entrada Financeira', 'INCOME')} className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xl shadow-emerald-900/40">
                    <DollarSign className="w-4 h-4" /> Receber Pagamento
                </button>
                {selectedOS.status !== OSStatus.PAID && selectedOS.status !== OSStatus.FINISHED && (
                    <button onClick={() => handleFinishOS(selectedOS.id)} className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/40">
                        <CheckCircle2 className="w-4 h-4" /> Finalizar Entrega
                    </button>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">PROGRESSO DA OBRA</h4>
               <div className="space-y-3">
                  {Object.values(OSStatus).map((s, i) => (
                    <button 
                        key={s} 
                        onClick={() => updateOSStatus(selectedOS.id, s)} 
                        className={`w-full flex items-center gap-5 p-4 rounded-2xl border transition-all ${selectedOS.status === s ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-50 opacity-60 hover:opacity-100'}`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${selectedOS.status === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{s}</span>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32 md:pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ordens de Serviço</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Gestão de obras e acompanhamento financeiro</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {serviceOrders.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <ClipboardList className="w-16 h-16 text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhuma obra em andamento</p>
          </div>
        )}
        {serviceOrders.map(os => (
          <div 
            key={os.id} 
            onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }} 
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
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
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Contrato</span>
                   <span className="text-base font-black text-slate-900 tracking-tighter">{formatCurrency(os.totalValue)}</span>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-tight px-1">
                   <MapPin className="w-4 h-4 text-blue-500 shrink-0" /> 
                   <span className="truncate">{os.customerAddress || 'Localização não informada'}</span>
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
              <span className="flex items-center gap-2 truncate max-w-[50%]"><Clock className="w-4 h-4" /> {new Date(os.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit(os); }}
                  className="p-2 flex items-center gap-1.5 text-amber-600 font-black hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> EDITAR
                </button>
                <div className="flex items-center gap-1.5 text-blue-600 font-black">
                   VER DETALHES <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;

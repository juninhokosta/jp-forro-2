
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus } from '../types';
import { 
  Plus, CheckCircle2, Clock, DollarSign, User, 
  Settings, Trash2, X, ClipboardList, MapPin, Phone, Fuel, ShoppingCart, 
  Utensils, Coffee, ChevronRight, TrendingUp, TrendingDown, LayoutList, Edit3, HardHat,
  ArrowRight, Calculator, Soup, PlusCircle
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { 
    serviceOrders, 
    updateOS, 
    updateOSStatus, 
    addTransaction, 
    catalog, 
    addCatalogItem, 
    removeCatalogItem, 
    transactions, 
    addOS 
  } = useApp();

  const [view, setView] = useState<'LIST' | 'CREATE' | 'CATALOG' | 'DETAIL'>('LIST');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

  const [quickInput, setQuickInput] = useState<{
    show: boolean;
    category: string;
    osId: string;
    type: 'INCOME' | 'EXPENSE';
    value: string;
  }>({
    show: false,
    category: '',
    osId: '',
    type: 'EXPENSE',
    value: ''
  });

  const [newOS, setNewOS] = useState({ 
    customerName: '', 
    customerContact: '', 
    customerAddress: '',
    description: '',
    additionalInfo: '',
    expectedDate: new Date().toISOString().split('T')[0],
    totalValue: ''
  });

  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'SERVICE' as 'SERVICE' | 'PRODUCT' });

  const handleAddOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.customerName) return;
    addOS({ 
      ...newOS, 
      status: OSStatus.QUOTED,
      totalValue: parseFloat(newOS.totalValue) || 0
    });
    setNewOS({ 
      customerName: '', customerContact: '', customerAddress: '', 
      description: '', additionalInfo: '', 
      expectedDate: new Date().toISOString().split('T')[0],
      totalValue: ''
    });
    setView('LIST');
  };

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    addCatalogItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      type: newItem.type as any
    });
    setNewItem({ name: '', price: '', type: 'SERVICE' });
  };

  const openQuickInput = (osId: string, category: string, type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    setQuickInput({ show: true, category, osId, type, value: '' });
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
        osId: quickInput.osId
      });
      setQuickInput({ ...quickInput, show: false });
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

  if (view === 'CATALOG') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-bold uppercase text-[10px] tracking-widest">
            <X className="w-5 h-5" /> Voltar
          </button>
          <h3 className="text-lg font-black text-slate-800">Catálogo</h3>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-700 mb-6 uppercase tracking-widest text-[10px]">Novo Item</h4>
          <form onSubmit={handleAddCatalogItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
              <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</label>
              <input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
              <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT">Produto</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Salvar</button>
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {catalog.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group shadow-sm">
              <div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === 'SERVICE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.type}</span>
                <p className="font-black text-slate-800 mt-1 text-sm">{item.name}</p>
                <p className="text-xs text-blue-600 font-black">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => removeCatalogItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'CREATE') {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 mb-20 md:mb-0">
          <div className="bg-blue-600 p-6 md:p-8 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-black">Nova Ordem</h3>
              <p className="text-blue-100 text-xs md:text-sm">Registre os detalhes do serviço</p>
            </div>
            <button onClick={() => setView('LIST')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <form onSubmit={handleAddOS} className="p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Cliente</label>
                <input type="text" required value={newOS.customerName} onChange={e => setNewOS({...newOS, customerName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-3 h-3" /> Valor Total</label>
                <input type="number" step="0.01" required value={newOS.totalValue} onChange={e => setNewOS({...newOS, totalValue: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600" placeholder="0,00" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> WhatsApp</label>
                <input type="text" value={newOS.customerContact} onChange={e => setNewOS({...newOS, customerContact: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 00000-0000" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Endereço</label>
                <input type="text" value={newOS.customerAddress} onChange={e => setNewOS({...newOS, customerAddress: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rua, Número..." />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-3 h-3" /> Serviço</label>
                <textarea required value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="O que será executado..." />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setView('LIST')} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-800 text-xs">Cancelar</button>
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">Salvar Ordem</button>
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

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-24 md:pb-10">
        {quickInput.show && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleQuickInputSubmit} className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-[90vw] md:max-w-md shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{quickInput.category}</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Registrar Lançamento</p>
                </div>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">R$</span>
                   <input autoFocus type="number" step="0.01" required value={quickInput.value} onChange={e => setQuickInput({ ...quickInput, value: e.target.value })} className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-2xl text-slate-800 transition-all" placeholder="0,00" />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">Confirmar <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-black uppercase text-[10px] tracking-widest"><X className="w-5 h-5" /> Fechar</button>
          <div className="flex gap-2">
            <button onClick={() => { const newVal = prompt("Ajustar Valor Total:", selectedOS.totalValue.toString()); if (newVal) updateOS(selectedOS.id, { totalValue: parseFloat(newVal) }); }} className="px-3 py-1.5 bg-white text-slate-600 rounded-xl text-[9px] font-black uppercase border shadow-sm flex items-center gap-1"><Edit3 className="w-3 h-3" /> Ajustar</button>
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getStatusColor(selectedOS.status)}`}>{selectedOS.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter truncate max-w-full">{selectedOS.customerName}</h2>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <p className="text-slate-500 font-black flex items-center gap-2 text-[10px] md:text-sm uppercase tracking-tight"><MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress}</p>
                    <p className="text-slate-500 font-black flex items-center gap-2 text-[10px] md:text-sm uppercase tracking-tight"><Phone className="w-4 h-4 text-blue-500" /> {selectedOS.customerContact}</p>
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CÓDIGO OS</p>
                  <p className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 md:px-4 md:py-2 rounded-xl border border-blue-100 text-xs md:text-base inline-block">{selectedOS.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8">
                  <div className="p-4 md:p-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] shadow-xl"><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">CONTRATO</p><p className="text-xl md:text-2xl font-black truncate">{formatCurrency(selectedOS.totalValue)}</p></div>
                  <div className="p-4 md:p-6 bg-emerald-600 text-white rounded-2xl md:rounded-[2rem] shadow-xl"><p className="text-[8px] md:text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1 md:mb-2">RECEBIDO</p><p className="text-xl md:text-2xl font-black truncate">{formatCurrency(totalIncome)}</p></div>
                  <div className="p-4 md:p-6 bg-amber-500 text-white rounded-2xl md:rounded-[2rem] shadow-xl"><p className="text-[8px] md:text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1 md:mb-2">SALDO</p><p className="text-xl md:text-2xl font-black truncate">{formatCurrency(remainingBalance)}</p></div>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-5 md:p-8 rounded-2xl md:rounded-[2rem] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="p-3 bg-white rounded-xl md:rounded-2xl shadow-sm text-rose-500 shrink-0"><Calculator className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div><h4 className="text-[9px] md:text-[11px] font-black text-rose-400 uppercase tracking-widest mb-0.5 md:mb-1">DESPESAS DA OBRA</h4><p className="text-2xl md:text-4xl font-black text-rose-600 tracking-tighter truncate">{formatCurrency(totalExpense)}</p></div>
                </div>
                <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto"><span className="text-[8px] md:text-[10px] font-black text-rose-400 uppercase tracking-widest">RESULTADO PARCIAL</span><p className="text-lg md:text-xl font-black text-slate-800">{formatCurrency(totalIncome - totalExpense)}</p></div>
              </div>
              <div className="bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100"><h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">DESCRIÇÃO</h4><p className="text-slate-700 font-bold text-sm md:text-base leading-relaxed italic">"{selectedOS.description}"</p></div>
            </div>
          </div>
          <div className="space-y-6 md:space-y-8">
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><Settings className="w-4 h-4" /> REGISTRAR</h4>
              
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                <button onClick={() => openQuickInput(selectedOS.id, 'Combustível')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <Fuel className="w-5 h-5 text-amber-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Gas</span>
                </button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Material')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Mat.</span>
                </button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Almoço')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Almoço</span>
                </button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Lanche')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <Coffee className="w-5 h-5 text-orange-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Lanche</span>
                </button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Jantar')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <Soup className="w-5 h-5 text-indigo-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Jantar</span>
                </button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Outros')} className="flex flex-col items-center gap-2 p-2.5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group active:scale-95">
                  <PlusCircle className="w-5 h-5 text-slate-400" />
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter">Extra</span>
                </button>
              </div>

              <div className="space-y-3">
                <button onClick={() => openQuickInput(selectedOS.id, 'Entrada', 'INCOME')} className="w-full bg-emerald-600 py-4 rounded-xl md:rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg"><DollarSign className="w-4 h-4" /> Entrada $</button>
                {selectedOS.status !== OSStatus.PAID && <button onClick={() => updateOSStatus(selectedOS.id, OSStatus.FINISHED)} className="w-full bg-blue-600 py-4 rounded-xl md:rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg"><CheckCircle2 className="w-4 h-4" /> Finalizar Obra</button>}
              </div>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">STATUS</h4>
               <div className="grid grid-cols-1 gap-2">
                  {Object.values(OSStatus).map((s, i) => (
                    <button key={s} onClick={() => updateOSStatus(selectedOS.id, s)} className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${selectedOS.status === s ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-50 opacity-80'}`}><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedOS.status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div><span className="text-xs font-black text-slate-700">{s}</span></button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Ordens de Serviço</h3></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setView('CATALOG')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm"><LayoutList className="w-4 h-4" /> Itens</button>
          <button onClick={() => setView('CREATE')} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-500/10"><Plus className="w-4 h-4" /> Nova</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {serviceOrders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center"><div className="bg-slate-50 p-6 rounded-full mb-4"><ClipboardList className="w-12 h-12 text-slate-300" /></div><p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Sem obras lançadas</p></div>
        )}
        {serviceOrders.map(os => (
          <div key={os.id} onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300">
            <div className="p-6 md:p-8">
               <div className="flex justify-between items-start mb-4 md:mb-6"><div className="space-y-1 min-w-0"><span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{os.id}</span><h4 className="text-lg md:text-xl font-black text-slate-900 mt-1 truncate">{os.customerName}</h4></div><span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border shrink-0 ${getStatusColor(os.status)}`}>{os.status}</span></div>
               <div className="space-y-3 mb-6 md:mb-8"><div className="flex justify-between items-center bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contrato</span><span className="text-sm md:text-base font-black text-slate-900 tracking-tight">{formatCurrency(os.totalValue)}</span></div><div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-tight px-1"><MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" /> <span className="truncate">{os.customerAddress || 'Local pendente'}</span></div></div>
               <div className="space-y-2"><div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest"><span>Evolução</span><span className="text-blue-600 font-black">{os.progress}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50"><div className={`h-full transition-all duration-1000 rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} /></div></div>
            </div>
            <div className="px-6 md:px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-widest"><span className="flex items-center gap-1.5 font-black truncate max-w-[50%]"><Clock className="w-3.5 h-3.5" /> {new Date(os.createdAt).toLocaleDateString()}</span><span className="flex items-center gap-1 text-blue-600 font-black">DETALHES <ChevronRight className="w-4 h-4" /></span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;


import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus } from '../types';
import { 
  Plus, CheckCircle2, Clock, DollarSign, User, 
  Settings, Trash2, X, ClipboardList, MapPin, Phone, Fuel, ShoppingCart, 
  Utensils, Coffee, ChevronRight, TrendingUp, TrendingDown, LayoutList, Edit3, HardHat,
  ArrowRight, Calculator
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

  const quickExpenseFixed = (osId: string, category: string, val: number) => {
    addTransaction({
      type: 'EXPENSE',
      amount: val,
      description: `${category} - OS ${osId}`,
      category: category,
      date: new Date().toISOString().split('T')[0],
      osId: osId
    });
    alert(`Lançamento de R$ ${val.toFixed(2)} efetuado.`);
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
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-bold uppercase text-xs">
            <X className="w-5 h-5" /> Voltar
          </button>
          <h3 className="text-lg font-black text-slate-800">Catálogo</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-700 mb-6 uppercase tracking-widest text-xs">Novo Item de Catálogo</h4>
          <form onSubmit={handleAddCatalogItem} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
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
            <button type="submit" className="bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Salvar Item</button>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
              <div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === 'SERVICE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.type}</span>
                <p className="font-black text-slate-800 mt-1">{item.name}</p>
                <p className="text-sm text-blue-600 font-black">{formatCurrency(item.price)}</p>
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
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black">Cadastrar Nova Ordem</h3>
              <p className="text-blue-100 text-sm">Registre os detalhes e informações do serviço</p>
            </div>
            <button onClick={() => setView('LIST')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleAddOS} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Cliente</label>
                <input type="text" required value={newOS.customerName} onChange={e => setNewOS({...newOS, customerName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do Cliente" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-3 h-3" /> Valor Total (R$)</label>
                <input type="number" step="0.01" required value={newOS.totalValue} onChange={e => setNewOS({...newOS, totalValue: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> WhatsApp</label>
                <input type="text" value={newOS.customerContact} onChange={e => setNewOS({...newOS, customerContact: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 00000-0000" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Endereço</label>
                <input type="text" value={newOS.customerAddress} onChange={e => setNewOS({...newOS, customerAddress: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rua, Número..." />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-3 h-3" /> Serviço</label>
                <textarea required value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="O que será executado..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Previsão</label>
                <input type="date" value={newOS.expectedDate} onChange={e => setNewOS({...newOS, expectedDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button type="button" onClick={() => setView('LIST')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
              <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 active:scale-95 transition-all">Salvar Ordem</button>
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
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        {quickInput.show && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleQuickInputSubmit} className="bg-white rounded-[2.5rem] p-10 w-full max-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{quickInput.category}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Lançar {quickInput.type === 'INCOME' ? 'Entrada' : 'Despesa'}</p>
                </div>
                <button type="button" onClick={() => setQuickInput({ ...quickInput, show: false })} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="space-y-6">
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-400">R$</span>
                   <input autoFocus type="number" step="0.01" required value={quickInput.value} onChange={e => setQuickInput({ ...quickInput, value: e.target.value })} className="w-full pl-20 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 font-black text-4xl text-slate-800 transition-all" placeholder="0,00" />
                </div>
                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all">Confirmar Lançamento <ArrowRight className="w-6 h-6" /></button>
              </div>
            </form>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-black uppercase text-[10px] tracking-widest"><X className="w-5 h-5" /> FECHAR DETALHES</button>
          <div className="flex gap-2">
            <button onClick={() => { const newVal = prompt("Ajustar Valor Total:", selectedOS.totalValue.toString()); if (newVal) updateOS(selectedOS.id, { totalValue: parseFloat(newVal) }); }} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase border shadow-sm"><Edit3 className="w-3.5 h-3.5" /> AJUSTAR VALOR</button>
            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm ${getStatusColor(selectedOS.status)}`}>{selectedOS.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{selectedOS.customerName}</h2>
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="text-slate-500 font-bold flex items-center gap-2 text-sm"><MapPin className="w-5 h-5 text-blue-500" /> {selectedOS.customerAddress}</p>
                    <p className="text-slate-500 font-bold flex items-center gap-2 text-sm"><Phone className="w-5 h-5 text-blue-500" /> {selectedOS.customerContact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CÓDIGO OS</p>
                  <p className="font-mono font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">{selectedOS.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">VALOR DO SERVIÇO</p><p className="text-3xl font-black">{formatCurrency(selectedOS.totalValue)}</p></div>
                  <div className="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl"><p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2">VALOR RECEBIDO</p><p className="text-3xl font-black">{formatCurrency(totalIncome)}</p></div>
                  <div className="p-6 bg-amber-500 text-white rounded-[2rem] shadow-xl"><p className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-2">SALDO A RECEBER</p><p className="text-3xl font-black">{formatCurrency(remainingBalance)}</p></div>
              </div>
              <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] mb-8 flex items-center justify-between group hover:bg-rose-100 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-rose-500 group-hover:scale-110 transition-transform"><Calculator className="w-8 h-8" /></div>
                  <div><h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">SOMA DAS DESPESAS DA OBRA</h4><p className="text-4xl font-black text-rose-600 tracking-tighter">{formatCurrency(totalExpense)}</p></div>
                </div>
                <div className="text-right"><span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Resultado Parcial</span><p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(totalIncome - totalExpense)}</p></div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100"><h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">DESCRIÇÃO</h4><p className="text-slate-700 font-semibold leading-relaxed italic">"{selectedOS.description}"</p></div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2"><Settings className="w-4 h-4" /> REGISTRAR DESPESA</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => openQuickInput(selectedOS.id, 'Combustível')} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group active:scale-95"><Fuel className="w-8 h-8 text-amber-400" /><span className="text-[10px] font-black uppercase text-slate-400">Combustível</span></button>
                <button onClick={() => openQuickInput(selectedOS.id, 'Material')} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group active:scale-95"><ShoppingCart className="w-8 h-8 text-blue-400" /><span className="text-[10px] font-black uppercase text-slate-400">Material</span></button>
              </div>
              <div className="space-y-4">
                <button onClick={() => openQuickInput(selectedOS.id, 'Entrada', 'INCOME')} className="w-full bg-emerald-600 py-6 rounded-3xl font-black text-base flex items-center justify-center gap-4 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-900/30"><DollarSign className="w-6 h-6" /> Registrar Entrada $</button>
                {selectedOS.status !== OSStatus.PAID && <button onClick={() => updateOSStatus(selectedOS.id, OSStatus.FINISHED)} className="w-full bg-blue-600 py-6 rounded-3xl font-black text-base flex items-center justify-center gap-4 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-900/30"><CheckCircle2 className="w-6 h-6" /> Finalizar (100%)</button>}
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8">STATUS</h4>
               <div className="space-y-3">
                  {Object.values(OSStatus).map((s, i) => (
                    <button key={s} onClick={() => updateOSStatus(selectedOS.id, s)} className={`w-full flex items-center gap-6 p-5 rounded-3xl border-2 transition-all ${selectedOS.status === s ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-50 opacity-60 hover:opacity-100'}`}><div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${selectedOS.status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div><div className="text-left"><span className="text-sm font-black text-slate-700 block tracking-tight">{s}</span></div></button>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div><h3 className="text-2xl font-black text-slate-800 tracking-tight">Ordens de Serviço</h3><p className="text-sm text-slate-500 font-medium">Controle de faturamento e obras</p></div>
        <div className="flex gap-3">
          <button onClick={() => setView('CATALOG')} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm"><LayoutList className="w-5 h-5" /> Catálogo</button>
          <button onClick={() => setView('CREATE')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-500/20"><Plus className="w-5 h-5" /> Nova Ordem</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {serviceOrders.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center"><div className="bg-slate-50 p-10 rounded-full mb-6"><ClipboardList className="w-20 h-20 text-slate-300" /></div><p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Aguardando lançamento da primeira obra</p><button onClick={() => setView('CREATE')} className="mt-6 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl">COMEÇAR AGORA</button></div>
        )}
        {serviceOrders.map(os => (
          <div key={os.id} onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500">
            <div className="p-8">
               <div className="flex justify-between items-start mb-6"><div className="space-y-1"><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{os.id}</span><h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-2 tracking-tight line-clamp-1">{os.customerName}</h4></div><span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-sm ${getStatusColor(os.status)}`}>{os.status}</span></div>
               <div className="space-y-4 mb-8"><div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato</span><span className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(os.totalValue)}</span></div><div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest px-1"><MapPin className="w-4 h-4 text-blue-500" /> <span className="truncate">{os.customerAddress || 'Endereço pendente'}</span></div></div>
               <div className="space-y-3"><div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>Nível de Execução</span><span className="text-blue-600 font-black">{os.progress}%</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner"><div className={`h-full transition-all duration-1000 rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} /></div></div>
            </div>
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]"><span className="flex items-center gap-2 font-bold"><Clock className="w-4 h-4" /> {new Date(os.createdAt).toLocaleDateString()}</span><span className="flex items-center gap-1 group-hover:text-blue-600 transition-all font-black">DETALHES DA OBRA <ChevronRight className="w-5 h-5" /></span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;

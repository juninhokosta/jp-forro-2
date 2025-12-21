
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus } from '../types';
import { 
  Plus, CheckCircle2, Clock, DollarSign, User, 
  Settings, Trash2, X, ClipboardList, MapPin, Phone, Info, Fuel, ShoppingCart, 
  Utensils, Coffee, ChevronRight, TrendingUp, TrendingDown, LayoutList, Edit3, HardHat
} from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { serviceOrders, updateOS, updateOSStatus, addTransaction, catalog, addCatalogItem, removeCatalogItem, transactions } = useApp();
  const [view, setView] = useState<'LIST' | 'CREATE' | 'CATALOG' | 'DETAIL'>('LIST');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

  // Form de Nova OS
  const [newOS, setNewOS] = useState({ 
    customerName: '', 
    customerContact: '', 
    customerAddress: '',
    description: '',
    additionalInfo: '',
    expectedDate: new Date().toISOString().split('T')[0],
    totalValue: ''
  });

  // Form de Catálogo
  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'SERVICE' as 'SERVICE' | 'PRODUCT' });

  const { addOS } = useApp();

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

  const quickExpense = (osId: string, category: string, fixedValue?: number) => {
    const val = fixedValue ? fixedValue.toString() : prompt(`Valor para ${category}:`, "0.00");
    if (val && !isNaN(parseFloat(val))) {
      addTransaction({
        type: 'EXPENSE',
        amount: parseFloat(val),
        description: `${category} - OS ${osId}`,
        category: category,
        date: new Date().toISOString().split('T')[0],
        osId: osId
      });
      alert(`${category} de R$ ${parseFloat(val).toFixed(2)} registrado com sucesso!`);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (view === 'CATALOG') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" /> Voltar
          </button>
          <h3 className="text-lg font-bold text-slate-800">Catálogo de Produtos e Serviços</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4">Cadastrar Novo Item no Catálogo</h4>
          <form onSubmit={handleAddCatalogItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Produto/Serviço</label>
              <input 
                type="text" 
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                placeholder="Ex: Forro PVC Branco"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Preço Base (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={newItem.price}
                onChange={e => setNewItem({...newItem, price: e.target.value})}
                placeholder="0,00"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Tipo</label>
              <select 
                value={newItem.type}
                onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT">Produto</option>
              </select>
            </div>
            <button type="submit" className="bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Adicionar ao Catálogo
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
              <div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === 'SERVICE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {item.type === 'SERVICE' ? 'Serviço' : 'Produto'}
                </span>
                <p className="font-bold text-slate-800 mt-1">{item.name}</p>
                <p className="text-sm text-blue-600 font-bold">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => removeCatalogItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Cliente
                </label>
                <input 
                  type="text" required
                  value={newOS.customerName}
                  onChange={e => setNewOS({...newOS, customerName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do Cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Valor Total do Serviço (R$)
                </label>
                <input 
                  type="number" step="0.01" required
                  value={newOS.totalValue}
                  onChange={e => setNewOS({...newOS, totalValue: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Telefone/WhatsApp
                </label>
                <input 
                  type="text"
                  value={newOS.customerContact}
                  onChange={e => setNewOS({...newOS, customerContact: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Endereço Completo
                </label>
                <input 
                  type="text"
                  value={newOS.customerAddress}
                  onChange={e => setNewOS({...newOS, customerAddress: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Número, Bairro, Cidade..."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-3 h-3" /> O que será executado? (Serviço)
                </label>
                <textarea 
                  required
                  value={newOS.description}
                  onChange={e => setNewOS({...newOS, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Descreva o serviço principal..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Previsão de Entrega
                </label>
                <input 
                  type="date"
                  value={newOS.expectedDate}
                  onChange={e => setNewOS({...newOS, expectedDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
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
    const profit = totalIncome - totalExpense;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors font-bold uppercase tracking-widest text-xs">
            <X className="w-5 h-5" /> Fechar Detalhes
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const newVal = prompt("Novo Valor Total do Serviço:", selectedOS.totalValue.toString());
                if (newVal) updateOS(selectedOS.id, { totalValue: parseFloat(newVal) });
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition-all"
            >
              <Edit3 className="w-3 h-3" /> Ajustar Valor Contrato
            </button>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border shadow-sm ${getStatusColor(selectedOS.status)}`}>
              {selectedOS.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Informações e Financeiro */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{selectedOS.customerName}</h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500" /> {selectedOS.customerAddress || 'Endereço não informado'}
                    </p>
                    <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-blue-500" /> {selectedOS.customerContact || 'Contato não informado'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle OS</p>
                  <p className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg mt-1">{selectedOS.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Serviço</p>
                    <p className="text-2xl font-black">{formatCurrency(selectedOS.totalValue)}</p>
                  </div>
                  <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-900/10">
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Valor Recebido</p>
                    <p className="text-2xl font-black">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-900/10">
                    <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest">Saldo a Receber</p>
                    <p className="text-2xl font-black">{formatCurrency(remainingBalance)}</p>
                  </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Serviço em Execução</h4>
                <p className="text-slate-700 font-medium leading-relaxed">{selectedOS.description}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                 <DollarSign className="w-6 h-6 text-emerald-500" /> Movimentações desta Obra
               </h3>
               
               <div className="space-y-3">
                  {osTransactions.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic border-2 border-dashed border-slate-50 rounded-2xl">Nenhuma movimentação registrada.</p>}
                  {osTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t.description}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.userName} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Coluna Direita: Ações Rápidas */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Despesas do Serviço
              </h4>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => quickExpense(selectedOS.id, 'Combustível')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 group">
                  <Fuel className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Combustível</span>
                </button>
                <button onClick={() => quickExpense(selectedOS.id, 'Material')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 group">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Material</span>
                </button>
                <button onClick={() => quickExpense(selectedOS.id, 'Almoço')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 group">
                  <Utensils className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Almoço</span>
                </button>
                <button onClick={() => quickExpense(selectedOS.id, 'Jantar/Lanche')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5 group">
                  <Coffee className="w-6 h-6 text-rose-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Jantar</span>
                </button>
              </div>

              {/* Mão de Obra Fixa */}
              <div className="bg-white/5 p-4 rounded-3xl mb-8 border border-white/10">
                <h5 className="text-[9px] font-black uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-2">
                  <HardHat className="w-3 h-3" /> Mão de Obra (Valor Fixo)
                </h5>
                <div className="grid grid-cols-2 gap-2">
                   {[100, 80, 50, 40].map(val => (
                     <button 
                        key={val}
                        onClick={() => quickExpense(selectedOS.id, 'Mão de Obra', val)}
                        className="bg-slate-800 hover:bg-blue-600 py-2 rounded-xl text-xs font-black transition-colors"
                     >
                        R$ {val}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const val = prompt("Registrar recebimento de valor (Entrada):", "0.00");
                    if(val && !isNaN(parseFloat(val))) {
                      addTransaction({ 
                        type: 'INCOME', 
                        amount: parseFloat(val), 
                        description: `Recebimento - OS ${selectedOS.id}`, 
                        category: 'Recebimento de OS', 
                        date: new Date().toISOString().split('T')[0], 
                        osId: selectedOS.id 
                      });
                      alert("Entrada registrada com sucesso!");
                    }
                  }}
                  className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <DollarSign className="w-5 h-5" /> Registrar Entrada $
                </button>
                
                {selectedOS.status !== OSStatus.FINISHED && selectedOS.status !== OSStatus.PAID && (
                  <button 
                    onClick={() => updateOSStatus(selectedOS.id, OSStatus.FINISHED)}
                    className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Finalizar Serviço (100%)
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Etapas do Serviço</h4>
               <div className="space-y-2">
                  {Object.values(OSStatus).map((s, i) => (
                    <button 
                    key={s} 
                    onClick={() => updateOSStatus(selectedOS.id, s)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedOS.status === s ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/5' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${selectedOS.status === s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-slate-700 block leading-tight">{s}</span>
                      </div>
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ordens de Serviço</h3>
          <p className="text-sm text-slate-500">Gestão de projetos e histórico financeiro</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('CATALOG')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95">
            <LayoutList className="w-5 h-5" /> Catálogo
          </button>
          <button onClick={() => setView('CREATE')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95">
            <Plus className="w-6 h-6" /> Cadastrar Nova OS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {serviceOrders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma OS encontrada</p>
          </div>
        )}
        {serviceOrders.map(os => (
          <div 
            key={os.id} 
            onClick={() => { setSelectedOSId(os.id); setView('DETAIL'); }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-500 border-l-4 border-l-transparent hover:border-l-blue-600"
          >
            <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{os.id}</span>
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-1">{os.customerName}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${getStatusColor(os.status)}`}>
                    {os.status}
                  </span>
               </div>
               
               <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(os.totalValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-black uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> {os.customerAddress || 'Local não definido'}
                  </div>
               </div>
               
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Progresso</span>
                      <span className="text-blue-600 font-black">{os.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                      <div 
                        className={`h-full transition-all duration-1000 rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                        style={{ width: `${os.progress}%` }} 
                      />
                  </div>
               </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(os.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 group-hover:text-blue-600 transition-colors">Detalhes <ChevronRight className="w-4 h-4" /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;

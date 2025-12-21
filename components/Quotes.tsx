
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, CheckCircle, XCircle, Search, ShoppingBag, Clock, Play } from 'lucide-react';
import { ProductItem, Quote } from '../types';

const Quotes: React.FC = () => {
  const { quotes, addQuote, updateQuoteStatus, catalog, createOSFromQuote } = useApp();
  const [showAddQuote, setShowAddQuote] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [items, setItems] = useState<ProductItem[]>([]);
  
  const [searchItem, setSearchItem] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');

  const filteredCatalog = catalog.filter(i => 
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleAddItemFromCatalog = (catalogItem: any) => {
    const item: ProductItem = {
      id: Math.random().toString(),
      name: catalogItem.name,
      price: parseFloat(customPrice) || catalogItem.price,
      quantity: parseInt(customQty) || 1
    };
    setItems([...items, item]);
    setSearchItem('');
    setCustomPrice('');
    setCustomQty('1');
  };

  const handleRemoveItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;
    addQuote({ customerName, customerContact, items, total });
    setCustomerName('');
    setCustomerContact('');
    setItems([]);
    setShowAddQuote(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Orçamentos</h3>
          <p className="text-sm text-slate-500">Histórico de propostas e aprovações</p>
        </div>
        <button 
          onClick={() => setShowAddQuote(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {showAddQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-2xl font-black">Montar Orçamento</h4>
                  <p className="text-blue-100 text-sm">Selecione itens do catálogo</p>
                </div>
                <button onClick={() => setShowAddQuote(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados do Cliente</h5>
                  <div className="space-y-3">
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do cliente" />
                    <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contato" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens Selecionados</h5>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {items.map(i => (
                      <div key={i.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{i.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{i.quantity} x {formatCurrency(i.price)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-blue-600">{formatCurrency(i.price * i.quantity)}</span>
                          <button onClick={() => handleRemoveItem(i.id)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                      <span className="text-slate-900 font-black uppercase text-xs">Total</span>
                      <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pesquisar Catálogo</h5>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Filtrar catálogo..." value={searchItem} onChange={e => setSearchItem(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input type="number" placeholder="Ajustar Preço" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs" />
                  <input type="number" placeholder="Qtd" value={customQty} onChange={e => setCustomQty(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs" />
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[350px]">
                  {filteredCatalog.map(item => (
                    <button key={item.id} type="button" onClick={() => handleAddItemFromCatalog(item)} className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <span className="text-xs font-black text-blue-600">{formatCurrency(item.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => setShowAddQuote(false)} className="px-6 py-3 font-bold text-slate-500">Cancelar</button>
              <button onClick={handleSubmit} className="px-12 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl">Salvar Orçamento</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes.map(q => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.id}</span>
                <h4 className="font-black text-slate-900 mt-1">{q.customerName}</h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                  q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  q.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600'
              }`}>
                  {q.status === 'PENDING' ? 'PENDENTE' : q.status === 'APPROVED' ? 'APROVADO' : 'RECUSADO'}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs font-black text-blue-600 flex justify-between uppercase">
                <span>Valor Total</span>
                <span>{formatCurrency(q.total)}</span>
            </div>
            <div className="flex flex-col gap-2">
                {q.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button onClick={() => updateQuoteStatus(q.id, 'APPROVED')} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Aprovar</button>
                    <button onClick={() => updateQuoteStatus(q.id, 'REJECTED')} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Recusar</button>
                  </div>
                ) : q.status === 'APPROVED' ? (
                  <button 
                    onClick={() => {
                        createOSFromQuote(q);
                        alert("Ordem de Serviço criada com sucesso!");
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    <Play className="w-3.5 h-3.5" /> Iniciar Execução (Criar OS)
                  </button>
                ) : (
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase py-2">Orçamento Finalizado</p>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotes;

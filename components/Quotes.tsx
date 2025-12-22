
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, CheckCircle, XCircle, Search, ShoppingBag, Clock, Play, UserPlus, MapPin } from 'lucide-react';
import { ProductItem, Quote, Customer } from '../types';

const Quotes: React.FC = () => {
  const { quotes, addQuote, updateQuoteStatus, catalog, createOSFromQuote, customers, addCustomer } = useApp();
  const [showAddQuote, setShowAddQuote] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [items, setItems] = useState<ProductItem[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');

  const filteredCatalog = catalog.filter(i => 
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerContact(c.contact);
    setCustomerAddress(c.address);
  };

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

    let finalCustomerId = selectedCustomerId;
    
    // Se não selecionou um cliente da lista, salva como novo cliente no banco de dados
    if (!finalCustomerId) {
      finalCustomerId = addCustomer({
        name: customerName,
        contact: customerContact,
        address: customerAddress
      });
    }

    addQuote({ 
      customerId: finalCustomerId,
      customerName, 
      customerContact, 
      items, 
      total 
    });

    setCustomerName('');
    setCustomerContact('');
    setCustomerAddress('');
    setSelectedCustomerId(null);
    setItems([]);
    setShowAddQuote(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Orçamentos</h3>
          <p className="text-sm text-slate-500 font-medium">Propostas comerciais e histórico de clientes</p>
        </div>
        <button 
          onClick={() => setShowAddQuote(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Orçamento
        </button>
      </div>

      {showAddQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-3xl font-black tracking-tighter">Novo Orçamento</h4>
                  <p className="text-blue-100 text-sm font-medium">Cadastre o cliente e selecione os itens do serviço</p>
                </div>
                <button onClick={() => setShowAddQuote(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Coluna 1: Banco de Dados de Clientes */}
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">BUSCAR CLIENTE SALVO</h5>
                 <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {customers.length === 0 && <p className="text-[10px] text-slate-400 italic">Banco de clientes vazio.</p>}
                    {customers.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedCustomerId === c.id ? 'border-blue-500 bg-blue-50' : 'border-slate-50 hover:border-slate-200'}`}
                      >
                         <p className="font-black text-slate-800 text-sm">{c.name}</p>
                         <p className="text-[10px] text-slate-500 mt-1">{c.contact}</p>
                      </button>
                    ))}
                 </div>
              </div>

              {/* Coluna 2: Dados Atuais */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><UserPlus className="w-4 h-4" /> DADOS DO CLIENTE</h5>
                  <div className="space-y-4">
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="Nome Completo" />
                    <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="WhatsApp / Contato" />
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="Endereço da Obra" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ITENS DA PROPOSTA</h5>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {items.length === 0 && <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Lista Vazia</div>}
                    {items.map(i => (
                      <div key={i.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group">
                        <div>
                          <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{i.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">{i.quantity} x {formatCurrency(i.price)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-blue-600">{formatCurrency(i.price * i.quantity)}</span>
                          <button onClick={() => handleRemoveItem(i.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 0 && (
                    <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-center px-4">
                      <span className="text-slate-900 font-black uppercase text-xs tracking-widest">Total Orçado</span>
                      <span className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(total)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Catálogo */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6 border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ITENS DO CATÁLOGO</h5>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Pesquisar..." value={searchItem} onChange={e => setSearchItem(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <input type="number" placeholder="R$ Preço" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                  <input type="number" placeholder="Qtd" value={customQty} onChange={e => setCustomQty(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                  {filteredCatalog.map(item => (
                    <button key={item.id} type="button" onClick={() => handleAddItemFromCatalog(item)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-95">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                         <p className="text-[10px] font-black text-blue-600 mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-6 shrink-0">
              <button type="button" onClick={() => setShowAddQuote(false)} className="px-8 py-4 font-black text-slate-400 uppercase text-xs tracking-widest">Cancelar</button>
              <button onClick={handleSubmit} className="px-16 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-95">Finalizar Proposta</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quotes.map(q => (
          <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">{q.id}</span>
                <h4 className="font-black text-slate-900 mt-2 text-xl tracking-tight line-clamp-1">{q.customerName}</h4>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${
                  q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  q.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600'
              }`}>
                  {q.status}
              </span>
            </div>
            <div className="p-6 bg-slate-50/50 rounded-[1.5rem] text-sm font-black text-blue-600 flex justify-between border border-slate-100">
                <span className="uppercase text-[10px] tracking-widest text-slate-400">Total da Proposta</span>
                <span>{formatCurrency(q.total)}</span>
            </div>
            <div className="flex flex-col gap-3">
                {q.status === 'PENDING' ? (
                  <div className="flex gap-3">
                    <button onClick={() => updateQuoteStatus(q.id, 'APPROVED')} className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100">Aprovar</button>
                    <button onClick={() => updateQuoteStatus(q.id, 'REJECTED')} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100">Recusar</button>
                  </div>
                ) : q.status === 'APPROVED' ? (
                  <button 
                    onClick={() => { createOSFromQuote(q); alert("OS Gerada com sucesso!"); }}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 shadow-xl shadow-blue-500/20"
                  >
                    <Play className="w-4 h-4" /> Iniciar Obra (Evoluir para OS)
                  </button>
                ) : (
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase py-2">Proposta Encerrada</p>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotes;

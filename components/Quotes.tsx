
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, XCircle, Search, UserPlus, Printer, MessageCircle, FileText, LayoutList, X, Minus, ChevronRight, Package, Calculator } from 'lucide-react';
import { ProductItem, Quote, Customer, CatalogItem } from '../types';

const Quotes: React.FC = () => {
  const { 
    quotes, 
    addQuote, 
    deleteQuote,
    updateQuoteStatus, 
    catalog, 
    createOSFromQuote, 
    customers, 
    addCustomer, 
    updateCatalogItem,
    addCatalogItem,
    removeCatalogItem
  } = useApp();

  const [view, setView] = useState<'LIST' | 'CATALOG'>('LIST');
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [selectedQuoteForExport, setSelectedQuoteForExport] = useState<Quote | null>(null);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [observations, setObservations] = useState('');
  
  const [items, setItems] = useState<ProductItem[]>([]);
  const [searchItem, setSearchItem] = useState('');

  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'SERVICE' as 'SERVICE' | 'PRODUCT' });

  const filteredCatalog = catalog.filter(i => 
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleAddItemFromCatalog = (catalogItem: CatalogItem) => {
    // Se o item já existir, incrementa a quantidade
    const existingIndex = items.findIndex(i => i.name === catalogItem.name);
    if (existingIndex > -1) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      const item: ProductItem = {
        id: Math.random().toString(36).substr(2, 5),
        name: catalogItem.name,
        price: catalogItem.price,
        quantity: 1
      };
      setItems([...items, item]);
    }
  };

  const updateItemQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateItemPrice = (id: string, newPrice: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, price: parseFloat(newPrice) || 0 };
      }
      return item;
    }));
  };

  const handleAddMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    addCatalogItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      type: newItem.type as any
    });
    setNewItem({ name: '', price: '', type: 'SERVICE' });
  };

  const handleRemoveItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;

    const finalCustomerId = addCustomer({
      name: customerName,
      contact: customerContact,
      address: customerAddress
    });

    addQuote({ 
      customerId: finalCustomerId,
      customerName, 
      customerContact, 
      items, 
      total,
      observations
    });

    setCustomerName('');
    setCustomerContact('');
    setCustomerAddress('');
    setObservations('');
    setItems([]);
    setShowAddQuote(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handlePrint = (q: Quote) => {
    setSelectedQuoteForExport(q);
    setTimeout(() => {
      window.print();
      setSelectedQuoteForExport(null);
    }, 500);
  };

  const handleWhatsApp = (q: Quote) => {
    const message = `*ORÇAMENTO - JP FORRO*\n\n` +
      `Olá ${q.customerName}, segue proposta:\n\n` +
      q.items.map(i => `- ${i.quantity}x ${i.name}: ${formatCurrency(i.price * i.quantity)}`).join('\n') +
      `\n\n*TOTAL: ${formatCurrency(q.total)}*\n` +
      (q.observations ? `\n_Obs: ${q.observations}_` : '');
    
    const phone = q.customerContact.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (view === 'CATALOG') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-32">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="bg-white p-3 rounded-2xl border flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-sm">
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
          </button>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Catálogo Master</h3>
        </div>
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-400 mb-8 uppercase tracking-widest text-[10px]">Cadastrar Novo Item no Catálogo</h4>
          <form onSubmit={handleAddMasterItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
              <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Ex: Forro PVC Especial" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Base (R$)</label>
              <input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
              <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black">
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT">Produto</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest">Salvar no Catálogo</button>
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-xl transition-all">
              <div>
                <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-blue-50 text-blue-600 border border-blue-100">{item.type}</span>
                <p className="font-black text-slate-800 mt-2 text-base leading-tight uppercase">{item.name}</p>
                <p className="text-sm text-blue-600 font-black mt-1">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => removeCatalogItem(item.id)} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32">
      {selectedQuoteForExport && (
        <div className="fixed inset-0 bg-white z-[999] p-10 overflow-auto print:block hidden">
          <div className="border-b-4 border-blue-600 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">JP FORRO</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Excelência em Revestimentos</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-blue-600">ORÇAMENTO: {selectedQuoteForExport.id}</p>
              <p className="text-xs font-bold text-slate-400">Data: {new Date(selectedQuoteForExport.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="font-black text-slate-800">{selectedQuoteForExport.customerName}</p>
          <table className="w-full mt-6 mb-10">
            <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
              <tr><th className="p-3 text-left">Item</th><th className="p-3 text-center">Qtd</th><th className="p-3 text-right">Subtotal</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedQuoteForExport.items.map(i => (
                <tr key={i.id} className="text-sm">
                  <td className="p-3 font-bold text-slate-800">{i.name}</td>
                  <td className="p-3 text-center font-bold">{i.quantity}</td>
                  <td className="p-3 text-right font-black">{formatCurrency(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={2} className="p-4 text-right font-black">TOTAL</td><td className="p-4 text-right font-black text-3xl text-blue-600">{formatCurrency(selectedQuoteForExport.total)}</td></tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="w-full">
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Orçamentos</h3>
          <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Geração de Propostas</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setView('CATALOG')} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95">
            <LayoutList className="w-4 h-4" /> Catálogo
          </button>
          <button onClick={() => setShowAddQuote(true)} className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Criar Orçamento
          </button>
        </div>
      </div>

      {showAddQuote && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 md:p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 md:p-10 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-2xl font-black tracking-tight uppercase">Montar Orçamento Profissional</h4>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Preencha os dados e selecione os itens</p>
                </div>
                <button onClick={() => setShowAddQuote(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">DADOS DO CLIENTE</h5>
                 <div className="space-y-4">
                   <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Nome do Cliente" />
                   <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="WhatsApp" />
                   <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Endereço" />
                   <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] font-medium text-sm" placeholder="Observações (Prazos, Garantia, etc)"></textarea>
                 </div>
              </div>

              <div className="lg:col-span-8 flex flex-col h-full space-y-6">
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 flex items-center justify-between">
                    ITENS DO ORÇAMENTO
                    <span className="text-blue-600">{items.length} itens selecionados</span>
                  </h5>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-6">
                    {items.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                         <Calculator className="w-16 h-16 mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">Selecione itens do catálogo abaixo</p>
                      </div>
                    )}
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter mb-1">{item.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400">Unitário:</span>
                            <input 
                              type="number" 
                              value={item.price} 
                              onChange={e => updateItemPrice(item.id, e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-black text-blue-600 outline-none focus:ring-1 focus:ring-blue-500" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 ml-4">
                          <div className="flex items-center bg-slate-50 rounded-2xl p-1 border">
                             <button onClick={() => updateItemQty(item.id, -1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><Minus className="w-4 h-4" /></button>
                             <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                             <button onClick={() => updateItemQty(item.id, 1)} className="p-2 hover:bg-white rounded-xl transition-all text-blue-600"><Plus className="w-4 h-4" /></button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Subtotal</p>
                            <p className="text-sm font-black text-slate-800 tracking-tighter">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                          <button onClick={() => handleRemoveItem(item.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-center shrink-0">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Final Estimado</span>
                        <span className="text-4xl font-black text-blue-600 tracking-tighter">{formatCurrency(total)}</span>
                     </div>
                     <button onClick={handleSubmit} className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                        Finalizar e Salvar
                     </button>
                  </div>
                </div>

                {/* Seletor de Catálogo Refinado */}
                <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                       <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">Adicionar do Catálogo</h6>
                       <div className="relative w-full">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="text" placeholder="Pesquisar serviço ou produto..." value={searchItem} onChange={e => setSearchItem(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-2xl outline-none text-white text-xs font-bold focus:bg-white/20 transition-all" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredCatalog.map(cat => (
                            <button 
                              key={cat.id} type="button" 
                              onClick={() => handleAddItemFromCatalog(cat)} 
                              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-600 text-left transition-all active:scale-95 group"
                            >
                                <div className="min-w-0 flex-1">
                                   <p className="text-[10px] font-black text-white group-hover:text-white truncate uppercase tracking-tight">{cat.name}</p>
                                   <p className="text-[9px] font-black text-blue-400 group-hover:text-blue-100 mt-0.5">{formatCurrency(cat.price)}</p>
                                </div>
                                <Plus className="w-4 h-4 text-blue-500 group-hover:text-white ml-3" />
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
        {quotes.map(q => (
          <div key={q.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">{q.id}</span>
                  <h4 className="font-black text-slate-900 text-2xl truncate tracking-tighter mt-3 leading-none uppercase">{q.customerName}</h4>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border shadow-sm ${
                  q.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  q.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>{q.status}</span>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposta</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatCurrency(q.total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handlePrint(q)} className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                  <Printer className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => handleWhatsApp(q)} className="flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                  <MessageCircle className="w-4 h-4" /> WHATSAPP
                </button>
              </div>

              {q.status === 'PENDING' ? (
                <button 
                  onClick={() => { if(confirm('Confirmar fechamento e gerar OS desta proposta?')) createOSFromQuote(q); }} 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
                >
                  <FileText className="w-4 h-4" /> Gerar Ordem de Serviço
                </button>
              ) : (
                  <button onClick={() => deleteQuote(q.id)} className="w-full py-4 text-slate-300 hover:text-rose-500 font-black text-[9px] uppercase tracking-[0.2em] transition-all">Excluir Orçamento</button>
              )}
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sem propostas ativas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;

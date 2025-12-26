
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, XCircle, Search, UserPlus, Printer, MessageCircle, FileText, LayoutList, X } from 'lucide-react';
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [observations, setObservations] = useState('');
  
  const [items, setItems] = useState<ProductItem[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');

  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catalogEditName, setCatalogEditName] = useState('');
  const [catalogEditPrice, setCatalogEditPrice] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'SERVICE' as 'SERVICE' | 'PRODUCT' });

  const filteredCatalog = catalog.filter(i => 
    i.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerContact(c.contact);
    setCustomerAddress(c.address);
  };

  const handleAddItemFromCatalog = (catalogItem: CatalogItem) => {
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

  const startEditCatalog = (item: CatalogItem) => {
    setEditingCatalogId(item.id);
    setCatalogEditName(item.name);
    setCatalogEditPrice(item.price.toString());
  };

  const saveCatalogEdit = (id: string) => {
    updateCatalogItem(id, {
      name: catalogEditName,
      price: parseFloat(catalogEditPrice) || 0
    });
    setEditingCatalogId(null);
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

  const handleDeleteQuote = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteQuote(id);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) return;

    let finalCustomerId = selectedCustomerId;
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
      total,
      observations
    });

    setCustomerName('');
    setCustomerContact('');
    setCustomerAddress('');
    setObservations('');
    setSelectedCustomerId(null);
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
      `Olá ${q.customerName}, segue sua proposta:\n\n` +
      q.items.map(i => `- ${i.quantity}x ${i.name}: ${formatCurrency(i.price * i.quantity)}`).join('\n') +
      `\n\n*TOTAL: ${formatCurrency(q.total)}*\n` +
      (q.observations ? `\n_Obs: ${q.observations}_` : '') +
      `\n\nAguardo seu retorno!`;
    
    const phone = q.customerContact.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (view === 'CATALOG') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-32 md:pb-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="text-slate-500 flex items-center gap-2 hover:text-slate-800 font-bold uppercase text-[10px] tracking-widest p-2">
            <X className="w-5 h-5" /> Voltar
          </button>
          <h3 className="text-lg font-black text-slate-800">Catálogo Master</h3>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-black text-slate-700 mb-6 uppercase tracking-widest text-[10px]">Novo Item</h4>
          <form onSubmit={handleAddMasterItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">Descrição</label>
              <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Ex: Mão de Obra" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">Preço Base</label>
              <input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="0,00" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">Tipo</label>
              <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT">Produto</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all uppercase text-xs tracking-widest">Adicionar Item</button>
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group shadow-sm">
              <div>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-blue-50 text-blue-600">{item.type}</span>
                <p className="font-black text-slate-800 mt-1 text-sm">{item.name}</p>
                <p className="text-xs text-blue-600 font-black">{formatCurrency(item.price)}</p>
              </div>
              <button onClick={() => removeCatalogItem(item.id)} className="p-3 text-slate-300 hover:text-rose-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32 md:pb-10">
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
          
          <div className="mb-10">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b mb-2">CLIENTE</h5>
              <p className="font-black text-slate-800">{selectedQuoteForExport.customerName}</p>
              <p className="text-sm text-slate-600">{selectedQuoteForExport.customerContact}</p>
          </div>

          <table className="w-full mb-10">
            <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-center">Qtd</th>
                <th className="p-3 text-right">Unitário</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedQuoteForExport.items.map(i => (
                <tr key={i.id} className="text-sm">
                  <td className="p-3 font-bold text-slate-800">{i.name}</td>
                  <td className="p-3 text-center font-bold">{i.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(i.price)}</td>
                  <td className="p-3 text-right font-black">{formatCurrency(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="p-4 text-right font-black">TOTAL</td>
                <td className="p-4 text-right font-black text-3xl text-blue-600">{formatCurrency(selectedQuoteForExport.total)}</td>
              </tr>
            </tfoot>
          </table>

          {selectedQuoteForExport.observations && (
            <div className="bg-slate-50 p-6 rounded-2xl mb-10">
              <p className="text-sm text-slate-700 italic">Obs: {selectedQuoteForExport.observations}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="w-full">
          <h3 className="text-2xl font-black text-slate-800">Orçamentos</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Gestão de propostas e catálogo</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button onClick={() => setView('CATALOG')} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
            <LayoutList className="w-4 h-4" /> Catálogo
          </button>
          <button onClick={() => setShowAddQuote(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Novo Orçamento
          </button>
        </div>
      </div>

      {showAddQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
                <h4 className="text-xl font-black tracking-tight">Novo Orçamento</h4>
                <button onClick={() => setShowAddQuote(false)} className="p-1"><XCircle className="w-8 h-8" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Nome Completo" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="(00) 00000-0000" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço da Obra</label>
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" placeholder="Logradouro, Nº, Bairro" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                    <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px] font-medium" placeholder="Prazos, formas de pagamento, etc..."></textarea>
                 </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">ITENS SELECIONADOS</h5>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {items.length === 0 && (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-black uppercase text-[10px] tracking-widest">
                       Nenhum item adicionado
                    </div>
                  )}
                  {items.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{i.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{i.quantity}x • {formatCurrency(i.price)}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className="text-xs font-black text-blue-600">{formatCurrency(i.price * i.quantity)}</span>
                        <button onClick={() => handleRemoveItem(i.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-500 uppercase">Total Geral</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatCurrency(total)}</span>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <h6 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3">Adicionar do Catálogo</h6>
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                       <input type="text" placeholder="Buscar no catálogo..." value={searchItem} onChange={e => setSearchItem(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Preço" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-[10px] font-bold" />
                        <input type="number" placeholder="Qtd" value={customQty} onChange={e => setCustomQty(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-[10px] font-bold" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
                        {filteredCatalog.map(item => (
                            <button key={item.id} type="button" onClick={() => handleAddItemFromCatalog(item)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:border-blue-500 hover:text-blue-600 active:scale-95 transition-all truncate max-w-[150px]">
                               + {item.name}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-end gap-3 shrink-0">
              <button onClick={() => setShowAddQuote(false)} className="order-2 md:order-1 px-8 py-4 font-black text-slate-400 uppercase text-xs tracking-widest">Sair</button>
              <button onClick={handleSubmit} className="order-1 md:order-2 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Salvar Orçamento</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {quotes.map(q => (
          <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{q.id}</span>
                <h4 className="font-black text-slate-900 text-lg truncate max-w-[200px]">{q.customerName}</h4>
              </div>
              <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
                q.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                q.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>{q.status}</span>
            </div>
            
            <div className="flex justify-between items-center py-4 border-y border-slate-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Proposto</span>
              <span className="text-xl font-black text-blue-600 tracking-tight">{formatCurrency(q.total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handlePrint(q)} className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-colors">
                <Printer className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => handleWhatsApp(q)} className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            </div>

            {q.status === 'PENDING' ? (
              <button 
                onClick={() => { if(confirm('Gerar OS desta proposta?')) createOSFromQuote(q); }} 
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all"
              >
                <FileText className="w-4 h-4" /> Gerar Ordem de Serviço
              </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => deleteQuote(q.id)} className="flex-1 p-3 text-slate-300 hover:text-rose-500 flex justify-center"><Trash2 className="w-5 h-5" /></button>
                </div>
            )}
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-slate-100 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sem orçamentos no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;


import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, CheckCircle, XCircle, Search, ShoppingBag, Clock, Play, UserPlus, MapPin, Printer, Send, Edit, MessageCircle, FileText } from 'lucide-react';
import { ProductItem, Quote, Customer, CatalogItem } from '../types';

const Quotes: React.FC = () => {
  const { quotes, addQuote, updateQuoteStatus, catalog, createOSFromQuote, customers, addCustomer, updateCatalogItem } = useApp();
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

  // Estado para edição do catálogo master
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catalogEditName, setCatalogEditName] = useState('');
  const [catalogEditPrice, setCatalogEditPrice] = useState('');

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

  const handleRemoveItem = (id: string) => setItems(items.filter(i => i.id !== id));

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
      `\n\nAguardo seu retorno para iniciarmos os trabalhos!`;
    
    const phone = q.customerContact.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Visualização de Impressão (Oculta na UI normal) */}
      {selectedQuoteForExport && (
        <div className="fixed inset-0 bg-white z-[999] p-10 overflow-auto print:block hidden">
          <div className="border-b-4 border-blue-600 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900">JP FORRO</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Excelência em Forros e Revestimentos</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-blue-600">ORÇAMENTO: {selectedQuoteForExport.id}</p>
              <p className="text-xs font-bold text-slate-400">Data: {new Date(selectedQuoteForExport.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b mb-2">CLIENTE</h5>
              <p className="font-black text-slate-800">{selectedQuoteForExport.customerName}</p>
              <p className="text-sm text-slate-600">{selectedQuoteForExport.customerContact}</p>
            </div>
          </div>

          <table className="w-full mb-10">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                <th className="p-3 text-left">Item / Descrição</th>
                <th className="p-3 text-center">Qtd</th>
                <th className="p-3 text-right">Unitário</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedQuoteForExport.items.map(i => (
                <tr key={i.id} className="text-sm">
                  <td className="p-3 font-bold text-slate-800">{i.name}</td>
                  <td className="p-3 text-center font-bold text-slate-500">{i.quantity}</td>
                  <td className="p-3 text-right font-bold text-slate-500">{formatCurrency(i.price)}</td>
                  <td className="p-3 text-right font-black text-blue-600">{formatCurrency(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="p-4 text-right font-black text-slate-500 uppercase tracking-widest">Valor Total do Orçamento</td>
                <td className="p-4 text-right font-black text-3xl text-blue-600">{formatCurrency(selectedQuoteForExport.total)}</td>
              </tr>
            </tfoot>
          </table>

          {selectedQuoteForExport.observations && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-10">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">OBSERVAÇÕES</h5>
              <p className="text-sm text-slate-700 italic">{selectedQuoteForExport.observations}</p>
            </div>
          )}

          <div className="text-center pt-20 border-t border-dashed border-slate-200">
             <div className="w-64 h-px bg-slate-300 mx-auto mb-2"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase">Assinatura do Responsável</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center no-print">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Orçamentos</h3>
          <p className="text-sm text-slate-500 font-medium">Propostas comerciais e histórico</p>
        </div>
        <button 
          onClick={() => setShowAddQuote(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Orçamento
        </button>
      </div>

      {showAddQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-10 bg-blue-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-2xl md:text-3xl font-black tracking-tighter">Novo Orçamento</h4>
                  <p className="text-blue-100 text-xs md:text-sm font-medium">Cadastre o cliente e selecione os itens</p>
                </div>
                <button onClick={() => setShowAddQuote(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
              {/* Coluna 1: Banco de Dados de Clientes */}
              <div className="space-y-6 lg:border-r pr-0 lg:pr-6">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">BUSCAR CLIENTE SALVO</h5>
                 <div className="space-y-2 max-h-[150px] lg:max-h-[400px] overflow-y-auto pr-2">
                    {customers.length === 0 && <p className="text-[10px] text-slate-400 italic">Nenhum cliente salvo.</p>}
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
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="Nome Completo" />
                    <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="WhatsApp" />
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="Endereço" />
                    <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm min-h-[60px]" placeholder="Observações do orçamento..."></textarea>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ITENS SELECIONADOS</h5>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {items.length === 0 && <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Lista Vazia</div>}
                    {items.map(i => (
                      <div key={i.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-[10px] uppercase truncate">{i.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold mt-0.5">{i.quantity} x {formatCurrency(i.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-blue-600 text-xs">{formatCurrency(i.price * i.quantity)}</span>
                          <button onClick={() => handleRemoveItem(i.id)} className="text-rose-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {items.length > 0 && (
                    <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center px-2">
                      <span className="text-slate-900 font-black uppercase text-[10px] tracking-widest">Total</span>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatCurrency(total)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Catálogo */}
              <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] space-y-6 border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ITENS DO CATÁLOGO</h5>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Pesquisar catálogo..." value={searchItem} onChange={e => setSearchItem(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Preço" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[10px]" title="Sobrescrever preço original" />
                  <input type="number" placeholder="Qtd" value={customQty} onChange={e => setCustomQty(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[10px]" />
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                  {filteredCatalog.map(item => (
                    <div key={item.id} className="group/item">
                      {editingCatalogId === item.id ? (
                        <div className="bg-white p-3 rounded-2xl border-2 border-blue-500 space-y-2 animate-in slide-in-from-top-2">
                           <input value={catalogEditName} onChange={e => setCatalogEditName(e.target.value)} className="w-full text-[10px] font-black border-b p-1 outline-none" placeholder="Nome item" />
                           <input type="number" value={catalogEditPrice} onChange={e => setCatalogEditPrice(e.target.value)} className="w-full text-[10px] font-black p-1 outline-none" placeholder="Valor" />
                           <div className="flex gap-2">
                             <button onClick={() => saveCatalogEdit(item.id)} className="flex-1 bg-blue-600 text-white p-1 rounded-lg text-[9px] font-black">SALVAR</button>
                             <button onClick={() => setEditingCatalogId(null)} className="flex-1 bg-slate-200 text-slate-600 p-1 rounded-lg text-[9px] font-black">X</button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleAddItemFromCatalog(item)} className="flex-1 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-95">
                            <div className="text-left">
                               <p className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[100px]">{item.name}</p>
                               <p className="text-[9px] font-black text-blue-600">{formatCurrency(item.price)}</p>
                            </div>
                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                          </button>
                          <button onClick={() => startEditCatalog(item)} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors" title="Editar item no catálogo master">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-3 md:gap-6 shrink-0">
              <button type="button" onClick={() => setShowAddQuote(false)} className="px-6 py-3 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cancelar</button>
              <button onClick={handleSubmit} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Finalizar Orçamento</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 no-print pb-20">
        {quotes.map(q => (
          <div key={q.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">{q.id}</span>
                <h4 className="font-black text-slate-900 mt-2 text-lg truncate max-w-[150px]">{q.customerName}</h4>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase border ${
                  q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  q.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600'
              }`}>
                  {q.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl text-xs font-black text-blue-600 flex justify-between border border-slate-100">
                <span className="uppercase text-[9px] tracking-widest text-slate-400">Total</span>
                <span>{formatCurrency(q.total)}</span>
            </div>

            {q.observations && (
              <p className="text-[10px] text-slate-500 font-medium italic line-clamp-2 px-1">"{q.observations}"</p>
            )}

            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handlePrint(q)} className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 shadow-sm"><Printer className="w-3.5 h-3.5" /> PDF</button>
                <button onClick={() => handleWhatsApp(q)} className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-100 shadow-sm"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</button>
            </div>

            <div className="flex flex-col gap-2">
                {q.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button onClick={() => updateQuoteStatus(q.id, 'APPROVED')} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Aprovar</button>
                    <button onClick={() => updateQuoteStatus(q.id, 'REJECTED')} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Recusar</button>
                  </div>
                ) : q.status === 'APPROVED' ? (
                  <button 
                    onClick={() => { createOSFromQuote(q); }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  >
                    <Play className="w-4 h-4" /> Iniciar Obra
                  </button>
                ) : (
                  <div className="text-center py-2 bg-slate-50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-black uppercase">Proposta Encerrada</span>
                  </div>
                )}
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full inline-block mb-4"><FileText className="w-12 h-12 text-slate-300" /></div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sem orçamentos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;

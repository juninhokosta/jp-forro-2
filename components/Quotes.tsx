
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { ProductItem } from '../types';

const Quotes: React.FC = () => {
  const { quotes, addQuote, updateQuoteStatus } = useApp();
  const [showAddQuote, setShowAddQuote] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [items, setItems] = useState<ProductItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return;
    const item: ProductItem = {
      id: Math.random().toString(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      quantity: parseInt(newItemQty)
    };
    setItems([...items, item]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Orçamentos</h3>
          <p className="text-sm text-slate-500">Histórico e criação de novos orçamentos</p>
        </div>
        <button 
          onClick={() => setShowAddQuote(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {showAddQuote && (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-in zoom-in duration-200">
          <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold">Criar Orçamento</h4>
              <button onClick={() => setShowAddQuote(false)}><XCircle className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Contato (WhatsApp/Tel)</label>
                <input 
                  type="text" 
                  value={customerContact}
                  onChange={e => setCustomerContact(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-700 text-sm">Itens/Produtos</h5>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="Descrição do item" 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none" 
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="number" 
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    placeholder="Preço R$" 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="number" 
                    value={newItemQty}
                    onChange={e => setNewItemQty(e.target.value)}
                    placeholder="Qtd" 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-900"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {items.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 text-sm">
                      <span className="font-medium text-slate-700">{i.name} (x{i.quantity})</span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-900">{formatCurrency(i.price * i.quantity)}</span>
                        <button onClick={() => handleRemoveItem(i.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center px-2">
                    <span className="text-slate-500 font-bold uppercase text-xs">Total do Orçamento</span>
                    <span className="text-xl font-black text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddQuote(false)} className="px-6 py-2 text-slate-500 font-medium">Descartar</button>
              <button type="submit" className="px-10 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Gerar Orçamento</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium italic">Nenhum orçamento registrado ainda.</div>
        )}
        {quotes.map(q => (
          <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{q.id}</span>
                <h4 className="font-bold text-slate-800">{q.customerName}</h4>
                <p className="text-xs text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  q.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
              }`}>
                  {q.status === 'PENDING' ? 'PENDENTE' : q.status === 'APPROVED' ? 'APROVADO' : 'RECUSADO'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                {q.items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-600">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(q.total)}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => updateQuoteStatus(q.id, 'APPROVED')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                    <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button 
                  onClick={() => updateQuoteStatus(q.id, 'REJECTED')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                    <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotes;

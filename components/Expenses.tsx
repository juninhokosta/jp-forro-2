
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Filter, Calendar, Edit3, Trash2, X, Info, MessageSquareText } from 'lucide-react';
import { Transaction } from '../types';

const Expenses: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Materiais');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const expenses = transactions.filter(t => t.type === 'EXPENSE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    if (editingId) {
      updateTransaction(editingId, {
        amount: parseFloat(amount),
        description: desc,
        category,
        date,
        notes
      });
      setEditingId(null);
    } else {
      addTransaction({
        type: 'EXPENSE',
        amount: parseFloat(amount),
        description: desc,
        category,
        date,
        notes
      });
    }
    
    setDesc('');
    setAmount('');
    setNotes('');
    setShowForm(false);
  };

  const handleEdit = (exp: Transaction) => {
    setEditingId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setShowForm(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Controle de Gastos</h3>
          <p className="text-sm text-slate-500">Gestão e detalhamento de saídas</p>
        </div>
        <button 
          onClick={() => {
              setEditingId(null);
              setDesc('');
              setAmount('');
              setNotes('');
              setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Fechar' : 'Nova Despesa'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-6">
            {editingId ? 'Editando Lançamento' : 'Novo Lançamento'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor (R$)</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                  <option>Materiais</option>
                  <option>Mão de Obra</option>
                  <option>Combustível</option>
                  <option>Alimentação</option>
                  <option>Impostos</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações / Detalhes (Opcional)</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm font-medium"
                    placeholder="Adicione detalhes como local de compra, motivo do gasto, etc..."
                  />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-800 text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase text-[10px] tracking-widest">
                {editingId ? 'Salvar Alterações' : 'Salvar Despesa'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Data</th>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5">Sócio</th>
                <th className="px-6 py-5 text-right">Valor</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <React.Fragment key={exp.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{exp.description}</p>
                        {exp.notes && (
                          <button 
                            onClick={() => setExpandedNotesId(expandedNotesId === exp.id ? null : exp.id)}
                            className={`p-1 rounded-md transition-colors ${expandedNotesId === exp.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-blue-600'}`}
                            title="Ver Observações"
                          >
                            <MessageSquareText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-widest border border-slate-200/50">{exp.category}</span>
                        {exp.osId && <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Obra: {exp.osId}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{exp.userName}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-rose-600">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(exp)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                              <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(confirm('Excluir esta despesa?')) deleteTransaction(exp.id); }} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                  {/* Linha de Detalhes Expandida */}
                  {expandedNotesId === exp.id && exp.notes && (
                    <tr className="bg-blue-50/30 animate-in slide-in-from-top-2 duration-200">
                      <td colSpan={5} className="px-8 py-4">
                        <div className="flex items-start gap-4">
                           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1"><Info className="w-4 h-4" /></div>
                           <div>
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">DETALHES DA DESPESA</p>
                              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{exp.notes}"</p>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {expenses.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                         <MessageSquareText className="w-12 h-12 mb-4" />
                         <p className="font-black uppercase tracking-widest text-[10px]">Nenhuma despesa registrada</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;

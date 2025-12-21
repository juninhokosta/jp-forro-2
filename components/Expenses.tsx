
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Filter, Calendar, Edit3, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';

const Expenses: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Materiais');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
      });
      setEditingId(null);
    } else {
      addTransaction({
        type: 'EXPENSE',
        amount: parseFloat(amount),
        description: desc,
        category,
        date,
      });
    }
    
    setDesc('');
    setAmount('');
    setShowForm(false);
  };

  const handleEdit = (exp: Transaction) => {
    setEditingId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setShowForm(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Controle de Gastos</h3>
          <p className="text-sm text-slate-500">Gestão e edição de saídas da sociedade</p>
        </div>
        <button 
          onClick={() => {
              setEditingId(null);
              setDesc('');
              setAmount('');
              setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Fechar' : 'Nova Despesa'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest mb-4">
            {editingId ? 'Editando Despesa' : 'Novo Lançamento'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Descrição</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Valor (R$)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>Materiais</option>
                <option>Mão de Obra</option>
                <option>Combustível</option>
                <option>Alimentação</option>
                <option>Impostos</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 pt-2">
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                {editingId ? 'Salvar Alterações' : 'Registrar Gastos'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{exp.description}</p>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">{exp.category}</span>
                    {exp.osId && <span className="ml-2 text-[9px] font-black text-blue-500 uppercase">OS: {exp.osId}</span>}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{exp.userName}</td>
                  <td className="px-6 py-4 text-right text-sm font-black text-rose-600">{formatCurrency(exp.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(exp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(confirm('Excluir esta despesa?')) deleteTransaction(exp.id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;

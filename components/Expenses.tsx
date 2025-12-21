
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Filter, Calendar } from 'lucide-react';

const Expenses: React.FC = () => {
  const { transactions, addTransaction, currentUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Materiais');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const expenses = transactions.filter(t => t.type === 'EXPENSE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    addTransaction({
      type: 'EXPENSE',
      amount: parseFloat(amount),
      description: desc,
      category,
      date,
    });
    setDesc('');
    setAmount('');
    setShowForm(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Controle de Gastos</h3>
          <p className="text-sm text-slate-500">Registre todas as saídas da sociedade</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-200 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
              <input 
                type="text" 
                value={desc} 
                onChange={e => setDesc(e.target.value)}
                placeholder="Ex: Compra de Gesso" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Materiais</option>
                <option>Mão de Obra</option>
                <option>Combustível</option>
                <option>Alimentação</option>
                <option>Impostos</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
              >
                Salvar Despesa
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Buscar despesas..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
            <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                    <Filter className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                    <Calendar className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Nenhuma despesa cadastrada.</td>
                  </tr>
              )}
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{exp.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-tighter">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {exp.userName.split(' ')[0][0]}
                    </div>
                    {exp.userName}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-rose-600">{formatCurrency(exp.amount)}</td>
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

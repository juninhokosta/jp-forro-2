
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OSStatus } from '../types';
import { Plus, CheckCircle2, Circle, Clock, DollarSign, ArrowRight, User } from 'lucide-react';

const ServiceOrders: React.FC = () => {
  const { serviceOrders, addOS, updateOSStatus, addTransaction, currentUser } = useApp();
  const [showAddOS, setShowAddOS] = useState(false);
  const [newOS, setNewOS] = useState({ customerName: '', description: '' });

  const handleAddOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.customerName) return;
    addOS({ ...newOS, status: OSStatus.QUOTED });
    setNewOS({ customerName: '', description: '' });
    setShowAddOS(false);
  };

  const getStatusColor = (status: OSStatus) => {
    switch (status) {
        case OSStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case OSStatus.FINISHED: return 'bg-blue-100 text-blue-700 border-blue-200';
        case OSStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ordens de Serviço</h3>
          <p className="text-sm text-slate-500">Gestão de projetos e faturamento</p>
        </div>
        <button 
          onClick={() => setShowAddOS(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Nova OS
        </button>
      </div>

      {showAddOS && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Cadastrar Nova Ordem</h3>
                <form onSubmit={handleAddOS} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                        <input 
                            type="text" 
                            required
                            value={newOS.customerName}
                            onChange={e => setNewOS({...newOS, customerName: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome completo do cliente"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Serviço</label>
                        <textarea 
                            value={newOS.description}
                            onChange={e => setNewOS({...newOS, description: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Descreva o que será feito..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddOS(false)} className="px-4 py-2 text-slate-500 font-medium">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Criar Ordem</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {serviceOrders.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                <Clock className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma Ordem de Serviço cadastrada ainda.</p>
            </div>
        )}
        {serviceOrders.map(os => (
          <div key={os.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{os.id}</span>
                <h4 className="text-lg font-bold text-slate-800 leading-tight">{os.customerName}</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(os.status)}`}>
                {os.status}
              </span>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">{os.description || 'Nenhuma descrição fornecida.'}</p>
              
              {/* Progress Bar */}
              <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                      <span>Progresso</span>
                      <span>{os.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{ width: `${os.progress}%` }} 
                      />
                  </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                  <button 
                    onClick={() => updateOSStatus(os.id, OSStatus.IN_PROGRESS)}
                    className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Marcar em Execução">
                      <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateOSStatus(os.id, OSStatus.FINISHED)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Concluir Serviço">
                      <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                        const amount = prompt('Valor do pagamento recebido:');
                        if (amount) {
                            addTransaction({
                                type: 'INCOME',
                                amount: parseFloat(amount),
                                description: `Pagamento OS ${os.id} - ${os.customerName}`,
                                category: 'Serviço',
                                date: new Date().toISOString().split('T')[0],
                                osId: os.id
                            });
                            updateOSStatus(os.id, OSStatus.PAID);
                        }
                    }}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Registrar Pagamento">
                      <DollarSign className="w-4 h-4" />
                  </button>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Criada em {new Date(os.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Detalhes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrders;


import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Settings as SettingsIcon, Database, RefreshCw, Copy, Download, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const { exportData, importData, currentUser } = useApp();
  const [syncCode, setSyncCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [importInput, setImportInput] = useState('');

  const handleExport = () => {
    const code = exportData();
    setSyncCode(code);
    setShowCode(true);
    navigator.clipboard.writeText(code);
    alert("Código de sincronização copiado para a área de transferência! Cole-o no outro dispositivo.");
  };

  const handleImport = () => {
    if (!importInput) return;
    if (confirm("ATENÇÃO: Isso irá apagar todos os dados atuais DESTE aparelho e substituir pelos dados do código. Deseja continuar?")) {
      try {
        importData(importInput);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Configurações do Sistema</h2>
          <p className="text-xs md:text-sm text-slate-500">Unificação de dados e segurança da conta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Sincronização */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
             <Database className="w-5 h-5 text-blue-600" />
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Sincronizar PC e Celular</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6 flex-1">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Para ver as mesmas obras e despesas no computador e no celular, use as ferramentas abaixo para transferir o banco de dados.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Download className="w-3 h-3" /> 1. Exportar deste aparelho
                 </h4>
                 <button 
                  onClick={handleExport}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                 >
                   Gerar Código de Sincronização
                 </button>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                 <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Upload className="w-3 h-3" /> 2. Importar para este aparelho
                 </h4>
                 <textarea 
                  value={importInput}
                  onChange={e => setImportInput(e.target.value)}
                  placeholder="Cole aqui o código gerado no outro dispositivo..."
                  className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-[10px] font-mono mb-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                 />
                 <button 
                  onClick={handleImport}
                  disabled={!importInput}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                 >
                   Sincronizar Agora
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Perfil */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-600" />
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Sua Conta</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6 flex-1">
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={currentUser?.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{currentUser?.name}</p>
                   <p className="text-[10px] text-slate-500 font-bold">{currentUser?.email}</p>
                </div>
             </div>

             <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold leading-tight">
                   O sistema armazena os dados localmente. Sempre que fizer muitas alterações no PC, lembre-se de exportar e importar no Celular para manter tudo atualizado.
                </p>
             </div>

             <div className="pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Versão do Aplicativo</p>
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                   <span>JP Financeiro v2.5.0</span>
                   <span className="text-emerald-500">Sistema Atualizado</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

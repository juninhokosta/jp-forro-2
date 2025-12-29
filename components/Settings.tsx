
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Settings as SettingsIcon, Database, Copy, Download, 
  Upload, ShieldCheck, AlertTriangle, FileJson, 
  Share2, CheckCircle2, RefreshCw 
} from 'lucide-react';

const Settings: React.FC = () => {
  const { exportData, importData, currentUser } = useApp();
  const [importInput, setImportInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCode = () => {
    const code = exportData();
    navigator.clipboard.writeText(code);
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    alert("CÓDIGO COPIADO! Agora abra o sistema no outro aparelho, vá em Configurações e cole este código no campo de Importação.");
  };

  const handleExportFile = () => {
    const data = exportData();
    const blob = new Blob([atob(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_jp_forro_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!importInput) {
      alert("Por favor, cole o código ou conteúdo do arquivo para importar.");
      return;
    }
    if (confirm("ATENÇÃO: Isso substituirá TODOS os dados deste aparelho pelos dados que você está importando. Deseja continuar?")) {
      try {
        // Tenta detectar se é código base64 ou JSON puro
        let finalCode = importInput;
        if (importInput.startsWith('{')) {
          finalCode = btoa(importInput);
        }
        importData(finalCode);
      } catch (e: any) {
        alert("Erro ao importar: O código fornecido é inválido.");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Painel de Unificação</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Gerencie seus dados entre Celular e PC</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado 1: Exportar (Sair com os dados) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-blue-600 flex items-center gap-3 text-white">
             <Download className="w-5 h-5" />
             <h3 className="text-xs font-black uppercase tracking-widest">1. Exportar Dados</h3>
          </div>
          <div className="p-8 space-y-6 flex-1">
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              Use esta opção no aparelho que tem as informações CORRETAS para enviá-las ao outro dispositivo.
            </p>

            <div className="grid grid-cols-1 gap-3">
               <button 
                onClick={handleExportCode}
                className="group w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-blue-500 transition-all flex items-center justify-between"
               >
                 <div className="flex items-center gap-3">
                   <Copy className="w-5 h-5 text-blue-600" />
                   <div className="text-left">
                     <p className="text-[10px] font-black uppercase text-slate-900">Copiar Código</p>
                     <p className="text-[9px] text-slate-400 font-bold">Para colar no outro navegador</p>
                   </div>
                 </div>
                 {isExporting && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" />}
               </button>

               <button 
                onClick={handleExportFile}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-slate-900 transition-all flex items-center justify-between"
               >
                 <div className="flex items-center gap-3">
                   <FileJson className="w-5 h-5 text-slate-900" />
                   <div className="text-left">
                     <p className="text-[10px] font-black uppercase text-slate-900">Baixar Arquivo .JSON</p>
                     <p className="text-[9px] text-slate-400 font-bold">Backup completo em arquivo</p>
                   </div>
                 </div>
                 <Download className="w-4 h-4 text-slate-300" />
               </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
               <Share2 className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
               <p className="text-[10px] text-blue-700 font-bold leading-tight">
                  Após copiar o código, envie para você mesmo via WhatsApp e abra no computador para sincronizar.
               </p>
            </div>
          </div>
        </div>

        {/* Lado 2: Importar (Entrar com os dados) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-emerald-600 flex items-center gap-3 text-white">
             <Upload className="w-5 h-5" />
             <h3 className="text-xs font-black uppercase tracking-widest">2. Importar Dados</h3>
          </div>
          <div className="p-8 space-y-6 flex-1">
             <p className="text-xs text-slate-500 leading-relaxed font-bold">
               Use esta opção no aparelho que está SEM as informações para receber os dados do outro dispositivo.
             </p>

             <div className="space-y-4">
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Carregar Arquivo de Backup</label>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileUpload}
                    className="w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Ou Cole o Código de Sincronização</label>
                   <textarea 
                    value={importInput}
                    onChange={e => setImportInput(e.target.value)}
                    placeholder="Cole aqui o código ou JSON..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                   />
                </div>

                <button 
                  onClick={handleImport}
                  disabled={!importInput}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Unificar Este Aparelho
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-amber-200 rounded-full text-amber-700 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Importante sobre a Unificação</h4>
            <p className="text-xs text-amber-700 font-bold mt-1 leading-relaxed">
              Como o sistema não usa um servidor de internet para salvar seus dados (para garantir sua privacidade), a sincronização deve ser feita manualmente. Toda vez que você fizer muitas obras no celular, use as ferramentas acima para "passar" os dados para o computador.
            </p>
          </div>
      </div>
    </div>
  );
};

export default Settings;

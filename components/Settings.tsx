
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Settings as SettingsIcon, Database, Copy, Download, 
  Upload, ShieldCheck, AlertTriangle, FileJson, 
  Share2, CheckCircle2, RefreshCw, Table, Cloud, ServerOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const { exportData, importData, currentUser, transactions, serviceOrders, customers } = useApp();
  const [importInput, setImportInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCode = () => {
    const code = exportData();
    navigator.clipboard.writeText(code);
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    alert("CÓDIGO DE UNIFICAÇÃO COPIADO! \n\nAgora cole este código no outro aparelho para UNIR as informações.");
  };

  const handleExportCSV = () => {
    // Gerar um CSV simples de transações como exemplo de exportação gratuita para Excel
    let csvContent = "data:text/csv;charset=utf-8,ID,Data,Descricao,Socio,Tipo,Valor,Obra\n";
    transactions.forEach(t => {
      csvContent += `${t.id},${t.date},${t.description.replace(/,/g, '')},${t.userName},${t.type},${t.amount},${t.osId || ''}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jp_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleImport = () => {
    if (!importInput) {
      alert("Por favor, cole o código gerado no outro aparelho.");
      return;
    }
    if (confirm("UNIFICAÇÃO INTELIGENTE: O sistema vai comparar os dados deste aparelho com os dados do código e UNIR tudo em uma lista única. Nenhuma informação será apagada, apenas somada. Continuar?")) {
      try {
        importData(importInput);
      } catch (e: any) {
        alert("Erro na Unificação: O código parece inválido ou incompleto.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Central de Unificação</h2>
            <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest">Sincronize Celular e PC sem perder dados</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Dados Criptografados Localmente</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Coluna 1: Status Atual */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Saúde do Banco
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Obras Registradas</span>
                        <span className="text-lg font-black text-slate-900">{serviceOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Lançamentos</span>
                        <span className="text-lg font-black text-slate-900">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Clientes</span>
                        <span className="text-lg font-black text-slate-900">{customers.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200">
                <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4"><Table className="w-6 h-6" /></div>
                <h4 className="text-lg font-black leading-tight uppercase tracking-tighter">Exportar para Excel</h4>
                <p className="text-blue-100 text-[10px] font-bold mt-2 leading-relaxed opacity-80">
                    Tenha uma cópia de segurança gratuita que pode ser aberta em qualquer computador.
                </p>
                <button 
                    onClick={handleExportCSV}
                    className="w-full mt-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95"
                >
                    Baixar Relatório CSV
                </button>
            </div>
        </div>

        {/* Coluna 2 e 3: Ação de Merge */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Unificação de Dispositivos</h3>
             </div>
             <div className="text-[9px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                Última Unificação: Hoje
             </div>
          </div>
          
          <div className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <h5 className="text-[10px] font-black text-blue-600 uppercase mb-2">PASSO 1: NO APARELHO COM DADOS</h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                            Clique no botão abaixo para gerar o código mestre das informações atuais deste aparelho.
                        </p>
                        <button 
                            onClick={handleExportCode}
                            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isExporting ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700'}`}
                        >
                            {isExporting ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {isExporting ? "Código Copiado!" : "Gerar Código de Fusão"}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-2">PASSO 2: NO APARELHO DESATUALIZADO</h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                            Cole o código gerado no outro aparelho aqui para unir as duas bases de dados.
                        </p>
                        <textarea 
                            value={importInput}
                            onChange={e => setImportInput(e.target.value)}
                            placeholder="Cole o código aqui..."
                            className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-[10px] font-mono outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] mb-3"
                        />
                        <button 
                            onClick={handleImport}
                            disabled={!importInput}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Unificar Informações
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                    <h5 className="text-xs font-black uppercase tracking-tight">O que acontece na unificação?</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                        O sistema JP Financeiro não apaga nada. Ele olha para o Celular e para o PC, identifica o que é novo em cada um e cria uma lista mestra. Se você cadastrou uma despesa no celular e outra no PC, após unificar, ambas aparecerão em ambos os aparelhos.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

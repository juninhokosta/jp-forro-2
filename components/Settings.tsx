
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Building2, Save, Upload, Image as ImageIcon, MapPin, Phone, MessageSquare } from 'lucide-react';

const Settings: React.FC = () => {
  const { companySettings, updateCompanySettings } = useApp();
  const [formData, setFormData] = useState(companySettings);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dados da Empresa</h2>
          <p className="text-sm text-slate-500">Configure as informações que aparecem nos orçamentos</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Seção Logo */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Logomarca da Empresa
              </label>
              <div className="relative group">
                <div className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo preview" className="w-full h-full object-contain p-6" />
                  ) : (
                    <div className="text-center p-6">
                       <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">Clique para enviar</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-medium italic text-center px-4 leading-tight">Sugestão: Use imagens em formato PNG ou JPG com fundo transparente para melhor resultado.</p>
            </div>

            {/* Seção Campos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                    placeholder="Ex: JP FORRO"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slogan / Subtítulo</label>
                  <input 
                    type="text" 
                    value={formData.slogan}
                    onChange={e => setFormData({...formData, slogan: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                    placeholder="Ex: Qualidade e confiança"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Telefone Contato</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Endereço Completo</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                    placeholder="Rua, Número, Bairro, Cidade"
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                 <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm shrink-0">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Dica de Exportação</h4>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">Estas informações serão exibidas no cabeçalho do orçamento quando você clicar em <strong>"Imprimir PDF"</strong>. Certifique-se de preencher corretamente para passar profissionalismo aos seus clientes.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3"
            >
              <Save className="w-4 h-4" /> Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

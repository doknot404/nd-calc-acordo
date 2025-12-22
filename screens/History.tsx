
import React, { useState, useEffect } from 'react';
import { AppView, CalculationEntry } from '../types';

interface HistoryProps {
  navigateTo: (view: AppView) => void;
}

const History: React.FC<HistoryProps> = ({ navigateTo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [calculations, setCalculations] = useState<CalculationEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const saved = localStorage.getItem('nd_calculations');
    if (saved) {
      try {
        setCalculations(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    } else {
      const initial: CalculationEntry[] = [
        { id: '1', name: 'Rescisão - João Silva', client: 'Empresa Tech Solutions', processNumber: '0012345-88.2023.5.01.0000', area: 'Trabalhista', date: '12/10/2023', value: 45200.00, status: 'Completo', tags: ['Urgente'] },
        { id: '2', name: 'Atualização Cível - Danos', client: 'Maria Oliveira', processNumber: '102030-22.2023.8.26.0000', area: 'Cível', date: '05/10/2023', value: 12500.00, status: 'Finalizado', tags: ['Acordo'] }
      ];
      setCalculations(initial);
      localStorage.setItem('nd_calculations', JSON.stringify(initial));
    }
  };

  const filteredCalcs = calculations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.processNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteCalc = (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro?")) {
      const updated = calculations.filter(c => c.id !== id);
      setCalculations(updated);
      localStorage.setItem('nd_calculations', JSON.stringify(updated));
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background-dark">
      <header className="flex-none flex items-center justify-between border-b border-border-dark bg-surface-dark px-8 py-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Meus Cálculos</h2>
          <p className="text-xs text-text-secondary">Histórico de memórias de cálculo salvas localmente.</p>
        </div>
        <button onClick={() => navigateTo(AppView.AREA_SELECTION)} className="h-11 px-6 bg-primary rounded-xl text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add_circle</span> NOVO CÁLCULO
        </button>
      </header>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
           <div className="flex flex-col gap-4 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl">
             <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined">search</span>
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 h-12 rounded-xl border border-border-dark bg-background-dark text-white placeholder-text-secondary outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="Pesquisar por cliente, processo, área ou nome do cálculo..." 
                />
             </div>
           </div>

           <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden shadow-2xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background-dark/50 border-b border-border-dark">
                      <th className="py-5 pl-8 pr-4 text-[10px] font-black uppercase text-text-secondary tracking-widest">Identificação do Cálculo</th>
                      <th className="py-5 px-4 text-[10px] font-black uppercase text-text-secondary tracking-widest">Área</th>
                      <th className="py-5 px-4 text-[10px] font-black uppercase text-text-secondary tracking-widest">Data</th>
                      <th className="py-5 px-4 text-[10px] font-black uppercase text-text-secondary tracking-widest text-right">Resultado</th>
                      <th className="py-5 pl-4 pr-8 text-[10px] font-black uppercase text-text-secondary tracking-widest text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/30">
                    {filteredCalcs.map((calc) => (
                      <tr key={calc.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-5 pl-8 pr-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base group-hover:text-primary transition-colors">{calc.name}</span>
                            <span className="text-xs text-text-secondary mt-0.5">{calc.client} • {calc.processNumber}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            calc.area === 'Trabalhista' ? 'bg-blue-500/10 text-blue-400' : 
                            calc.area === 'Cível' ? 'bg-emerald-500/10 text-emerald-400' : 
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {calc.area}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-xs font-medium text-text-secondary">{calc.date}</td>
                        <td className="py-5 px-4 text-right">
                          <span className="font-mono font-bold text-white bg-background-dark/50 px-3 py-1.5 rounded-lg border border-border-dark">
                            {typeof calc.value === 'number' ? calc.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : calc.value}
                          </span>
                        </td>
                        <td className="py-5 pl-4 pr-8 text-center">
                           <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg bg-surface-dark-alt text-text-secondary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                              <button onClick={() => deleteCalc(calc.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCalcs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <div className="flex flex-col items-center opacity-30">
                            <span className="material-symbols-outlined text-6xl">folder_off</span>
                            <p className="font-bold uppercase tracking-widest text-xs mt-4">Nenhum cálculo encontrado</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>
    </main>
  );
};

export default History;


import React from 'react';
import { AppView } from '../types';

interface AreaSelectionProps {
  navigateTo: (view: AppView) => void;
}

const AreaSelection: React.FC<AreaSelectionProps> = ({ navigateTo }) => {
  const areas = [
    { view: AppView.TRABALHISTA_HUB, title: 'Trabalhista', icon: 'work', color: 'text-primary', bg: 'bg-primary/10', desc: 'Rescisões, HE, FGTS e verbas.' },
    { view: AppView.CIVIL_HUB, title: 'Cível', icon: 'gavel', color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Indenizações e atualizações.' },
    { view: AppView.PREVIDENCIARIO_HUB, title: 'Previdenciário', icon: 'description', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'INSS, RMI e períodos.' },
    { view: AppView.AGREEMENT_SIMULATOR, title: 'Acordos', icon: 'handshake', color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Propostas e parcelamentos.' }
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background-dark overflow-y-auto">
      <div className="w-full max-w-[900px]">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Selecione a Área</h1>
          <p className="text-text-secondary text-lg">Qual tipo de cálculo você deseja iniciar agora?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {areas.map((area) => (
            <button 
              key={area.title}
              onClick={() => navigateTo(area.view)}
              className="flex flex-col gap-4 p-8 rounded-3xl bg-surface-dark border border-border-dark hover:border-white/20 transition-all hover:scale-[1.02] active:scale-95 group text-left"
            >
              <div className={`${area.bg} ${area.color} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-4xl">{area.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{area.title}</h3>
                <p className="text-text-secondary">{area.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigateTo(AppView.DASHBOARD)} 
            className="text-text-secondary hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar para o Início
          </button>
        </div>
      </div>
    </main>
  );
};

export default AreaSelection;

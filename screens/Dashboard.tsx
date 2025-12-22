
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  navigateTo: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-8 py-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Painel Principal</h2>
          <p className="text-text-secondary text-sm">Bem-vindo ao ND-Calc, sua central de cálculos jurídicos.</p>
        </div>
        <button 
          onClick={() => navigateTo(AppView.AREA_SELECTION)} 
          className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95"
        >
          <span className="mr-2 material-symbols-outlined text-[20px]">add_circle</span>
          NOVO CÁLCULO
        </button>
      </header>

      <div className="flex-1 p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest text-xs opacity-50">Áreas de Especialidade</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <div onClick={() => navigateTo(AppView.TRABALHISTA_HUB)} className="p-6 rounded-2xl bg-surface-dark border border-border-dark hover:border-primary cursor-pointer transition-all group flex flex-col gap-4 shadow-sm hover:shadow-primary/5">
               <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined text-3xl">work</span>
               </div>
               <div>
                 <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Trabalhista</h4>
                 <p className="text-sm text-text-secondary mt-1">Rescisões, HE e verbas rescisórias.</p>
               </div>
             </div>

             <div onClick={() => navigateTo(AppView.CIVIL_HUB)} className="p-6 rounded-2xl bg-surface-dark border border-border-dark hover:border-emerald-500 cursor-pointer transition-all group flex flex-col gap-4 shadow-sm hover:shadow-emerald-500/5">
               <div className="bg-emerald-500/10 w-14 h-14 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined text-3xl">gavel</span>
               </div>
               <div>
                 <h4 className="text-xl font-bold text-white group-hover:text-emerald-500 transition-colors">Cível</h4>
                 <p className="text-sm text-text-secondary mt-1">Atualizações, juros e revisões.</p>
               </div>
             </div>

             <div onClick={() => navigateTo(AppView.PREVIDENCIARIO_HUB)} className="p-6 rounded-2xl bg-surface-dark border border-border-dark hover:border-amber-500 cursor-pointer transition-all group flex flex-col gap-4 shadow-sm hover:shadow-amber-500/5">
               <div className="bg-amber-500/10 w-14 h-14 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined text-3xl">description</span>
               </div>
               <div>
                 <h4 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Previdenciário</h4>
                 <p className="text-sm text-text-secondary mt-1">Benefícios e tempo de contribuição.</p>
               </div>
             </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest text-xs opacity-50">Ferramentas de Apoio</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => navigateTo(AppView.AGREEMENT_SIMULATOR)}
              className="flex items-center gap-5 px-8 py-6 bg-surface-dark-alt/30 hover:bg-primary/10 border border-border-dark hover:border-primary text-white rounded-2xl transition-all group"
            >
              <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">handshake</span>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">Simulador de Acordos</span>
                <span className="text-sm text-text-secondary">Propostas, parcelamento e adesão</span>
              </div>
            </button>
            <button 
              onClick={() => navigateTo(AppView.HISTORY)}
              className="flex items-center gap-5 px-8 py-6 bg-surface-dark-alt/30 hover:bg-primary/10 border border-border-dark hover:border-primary text-white rounded-2xl transition-all group"
            >
              <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">folder_open</span>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">Meus Cálculos</span>
                <span className="text-sm text-text-secondary">Acessar histórico completo</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;


import React from 'react';
import { AppView } from '../types';
import { IMAGES } from '../constants';

interface SidebarProps {
  currentView: AppView;
  navigateTo: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigateTo }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { view: AppView.HISTORY, label: 'Meus Cálculos', icon: 'calculate' },
    { view: AppView.AGREEMENT_SIMULATOR, label: 'Simulador de Acordos', icon: 'handshake' },
    { view: AppView.TRABALHISTA_HUB, label: 'Trabalhista', icon: 'work' },
    { view: AppView.CIVIL_HUB, label: 'Cível', icon: 'gavel' },
    { view: AppView.PREVIDENCIARIO_HUB, label: 'Previdenciário', icon: 'description' },
    { view: AppView.SETTINGS, label: 'Configurações', icon: 'settings' },
    { view: AppView.HELP, label: 'Ajuda', icon: 'help' },
  ];

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border-dark bg-background-dark md:flex overflow-y-auto print:hidden">
      <div className="flex h-full min-h-screen flex-col justify-between p-4">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="bg-primary flex items-center justify-center rounded-lg size-10 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-[24px]">balance</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-bold leading-tight tracking-tight">ND-Calc</h1>
              <p className="text-text-secondary text-xs font-normal">Advocacia Silva</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  currentView === item.view
                    ? 'bg-primary/10 border-l-[3px] border-primary text-white'
                    : 'text-text-secondary hover:bg-surface-dark-alt/50 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${currentView === item.view ? 'fill-current' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-2 pb-4">
          <div className="flex items-center gap-3 p-2 mb-4">
             <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-surface-dark-alt" style={{ backgroundImage: `url(${IMAGES.USER})` }}></div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">Dr. Carlos Silva</span>
                <span className="text-xs text-text-secondary truncate">Advogado Sênior</span>
             </div>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-dark-alt/30 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

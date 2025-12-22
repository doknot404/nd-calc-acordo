
import React from 'react';
import { AppView, CalculatorType } from '../types';
import { IMAGES } from '../constants';

interface TrabalhistaHubProps {
  navigateTo: (view: AppView, calcType?: CalculatorType) => void;
}

const TrabalhistaHub: React.FC<TrabalhistaHubProps> = ({ navigateTo }) => {
  const categories = [
    { id: CalculatorType.RESCISAO, title: 'Rescisão CLT', desc: 'Cálculo completo de verbas contratuais e passivos.', icon: 'calculate', color: 'bg-primary', img: IMAGES.RESCISAO },
    { id: CalculatorType.HORAS_EXTRAS, title: 'Horas Extras', desc: 'Apuração de suplementares, adicionais e DSR.', icon: 'schedule', color: 'bg-emerald-600', img: IMAGES.HORAS_EXTRAS },
  ];

  const subCategories = [
    { id: CalculatorType.DIFERENCA_SALARIAL, label: 'Diferença Salarial', desc: 'Salário devido vs Salário pago', icon: 'compare_arrows' },
    { id: CalculatorType.DESVIO_FUNCAO, label: 'Desvio de Função', desc: 'Acúmulo ou substituição de cargo', icon: 'engineering' },
    { id: CalculatorType.INSALUBRIDADE, label: 'Insalubridade', desc: 'Adicional de 10%, 20% ou 40%', icon: 'health_and_safety' },
    { id: CalculatorType.PERICULOSIDADE, label: 'Periculosidade', desc: 'Adicional de 30% sobre salário', icon: 'warning' },
    { id: CalculatorType.FGTS_ATRASO, label: 'FGTS em Atraso', desc: 'Regularização de depósitos e multa', icon: 'savings' },
    { id: CalculatorType.ADICIONAL_NOTURNO, label: 'Adicional Noturno', desc: 'Cálculo de jornada noturna e reflexos', icon: 'nightlight' },
  ];

  return (
    <main className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <button onClick={() => navigateTo(AppView.DASHBOARD)} className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Home
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-white font-medium">Trabalhista</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-white">Área Trabalhista</h1>
          <p className="text-text-secondary text-lg">Especialize seus cálculos com ferramentas precisas de liquidação.</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateTo(AppView.CALCULATION_FORM, cat.id)}
              className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-surface-dark shadow-lg transition-all hover:-translate-y-1 h-56 border border-border-dark hover:border-primary/50"
            >
              <div 
                className="absolute inset-0 z-0 h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                style={{ backgroundImage: `linear-gradient(180deg, rgba(16, 22, 34, 0.1) 0%, rgba(16, 22, 34, 0.95) 100%), url("${cat.img}")` }}
              ></div>
              <div className="relative z-10 p-6 text-left">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${cat.color} text-white`}>
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-white">{cat.title}</h4>
                <p className="text-sm text-gray-300">{cat.desc}</p>
              </div>
            </button>
          ))}
        </section>

        <section className="mt-4">
          <div className="mb-6 border-b border-border-dark pb-2">
            <h3 className="text-lg font-bold text-white">Calculadoras Adicionais</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => navigateTo(AppView.CALCULATION_FORM, item.id)}
                className="flex items-center justify-between rounded-lg border border-border-dark bg-surface-dark p-4 transition-all hover:border-primary group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dark-alt text-text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{item.label}</h5>
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{item.desc}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary">arrow_forward</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrabalhistaHub;


import React, { useState, useMemo } from 'react';
import { AppView, CalculatorType, CalculationEntry } from '../types';

interface TableRow {
  id: string;
  description: string;
  start: string;
  end: string;
  baseValue: number;
  paidValue?: number;
  index?: string;
  interest?: number;
}

interface CalculationResultItem {
  label: string;
  value: number | string;
  type: 'pro' | 'con' | 'info';
}

interface CalculationFormProps {
  navigateTo: (view: AppView) => void;
  calcType: CalculatorType;
}

const CalculationForm: React.FC<CalculationFormProps> = ({ navigateTo, calcType }) => {
  const [clientName, setClientName] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  
  // Tabela de Lançamentos com IDs únicos
  const [rows, setRows] = useState<TableRow[]>([
    { id: 'row-' + Date.now(), description: 'Período 1', start: '2023-01-01', end: '2023-12-31', baseValue: 3500.00, paidValue: 0, index: 'IPCA-E', interest: 1 }
  ]);
  
  // Parâmetros de Configuração
  const [percentualAdicional, setPercentualAdicional] = useState(20);
  const [genero, setGenero] = useState<'m' | 'f'>('m');
  const [multiplicadorEspecial, setMultiplicadorEspecial] = useState(1.4);
  const [config, setConfig] = useState({
    reflexos: true,
    especial: false,
    fgts: true
  });

  const getCalcInfo = () => {
    switch (calcType) {
      case CalculatorType.DESVIO_FUNCAO: return { title: 'Desvio / Acúmulo de Função', area: 'Trabalhista' };
      case CalculatorType.ATUALIZACAO_CIVIL: return { title: 'Atualização Cível', area: 'Cível' };
      case CalculatorType.ATRASADOS_PREV: return { title: 'Cálculo de Atrasados', area: 'Previdenciário' };
      case CalculatorType.PLANEJAMENTO_PREV: return { title: 'Planejamento de Aposentadoria', area: 'Previdenciário' };
      case CalculatorType.TEMPO_CONTRIBUICAO: return { title: 'Tempo de Contribuição', area: 'Previdenciário' };
      case CalculatorType.HORAS_EXTRAS: return { title: 'Horas Extras', area: 'Trabalhista' };
      case CalculatorType.RESCISAO: return { title: 'Rescisão CLT', area: 'Trabalhista' };
      default: return { title: 'Cálculo Jurídico', area: 'Geral' };
    }
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    setRows([...rows, { 
      id: 'row-' + Math.random().toString(36).substr(2, 9),
      description: `Período ${rows.length + 1}`,
      start: last.end || '', 
      end: '', 
      baseValue: last.baseValue, 
      paidValue: 0,
      index: last.index || 'IPCA-E', 
      interest: last.interest || 1 
    }]);
  };

  const updateRow = (id: string, field: keyof TableRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRow = (id: string) => rows.length > 1 && setRows(rows.filter(r => r.id !== id));

  // Lógica de Cálculo Unificada
  const results = useMemo(() => {
    const items: CalculationResultItem[] = [];
    let grandTotalValue = 0;
    let totalDaysAcc = 0;

    rows.forEach((row, idx) => {
      const d1 = new Date(row.start);
      const d2 = new Date(row.end);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return;

      const days = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const months = Math.max(1, Math.round(days / 30.44));
      const prefix = rows.length > 1 ? `[P${idx + 1}] ` : '';

      // --- CÍVEL / ATRASADOS ---
      if (calcType === CalculatorType.ATUALIZACAO_CIVIL || calcType === CalculatorType.ATRASADOS_PREV) {
        const principal = row.baseValue - (row.paidValue || 0);
        // Simulação de correção (na vida real usaria tabela histórica)
        const fatorIndex = row.index === 'SELIC' ? 0.15 : row.index === 'IPCA-E' ? 0.10 : 0.08;
        const corrigido = principal * (1 + fatorIndex);
        const jurosMora = corrigido * ((row.interest || 0) / 100) * months;
        const totalLote = corrigido + jurosMora;
        
        items.push({ label: `${prefix}Diferença Original`, value: principal, type: 'info' });
        items.push({ label: `${prefix}Principal Corrigido`, value: corrigido, type: 'pro' });
        items.push({ label: `${prefix}Juros Mora (${row.interest}% x ${months}m)`, value: jurosMora, type: 'pro' });
        grandTotalValue += totalLote;
      }
      // --- TRABALHISTA (Desvio) ---
      else if (calcType === CalculatorType.DESVIO_FUNCAO) {
        const base = row.baseValue;
        const adicional = base * (percentualAdicional / 100);
        const subTotalPlus = adicional * months;
        items.push({ label: `${prefix}Plus Salarial (${percentualAdicional}%)`, value: subTotalPlus, type: 'pro' });
        
        if (config.reflexos) {
          const dsr = subTotalPlus / 6;
          const r13 = (subTotalPlus + dsr) / 12;
          const fer = ((subTotalPlus + dsr) / 12) * 1.3333;
          const fgts = (subTotalPlus + dsr + r13 + fer) * 0.08;
          items.push({ label: `${prefix}Reflexo DSR`, value: dsr, type: 'pro' });
          items.push({ label: `${prefix}Reflexo 13º/Férias`, value: r13 + fer, type: 'pro' });
          items.push({ label: `${prefix}FGTS (8%)`, value: fgts, type: 'pro' });
          grandTotalValue += (subTotalPlus + dsr + r13 + fer + fgts);
        } else {
          grandTotalValue += subTotalPlus;
        }
      }
      // --- PREVIDENCIÁRIO (Contagem/Planejamento) ---
      else if (calcType === CalculatorType.TEMPO_CONTRIBUICAO || calcType === CalculatorType.PLANEJAMENTO_PREV) {
        let d = days;
        if (config.especial) d = Math.floor(d * multiplicadorEspecial);
        totalDaysAcc += d;
        items.push({ label: `${prefix}Período Apurado`, value: `${Math.floor(d/365)}a ${Math.floor((d%365)/30)}m ${d%30}d`, type: 'info' });
      }
    });

    if (calcType === CalculatorType.TEMPO_CONTRIBUICAO || calcType === CalculatorType.PLANEJAMENTO_PREV) {
      const anos = Math.floor(totalDaysAcc / 365);
      const meses = Math.floor((totalDaysAcc % 365) / 30.44);
      const dias = Math.floor(totalDaysAcc % 30.44);
      const tempoFormatado = `${anos}a, ${meses}m, ${dias}d`;
      
      if (calcType === CalculatorType.PLANEJAMENTO_PREV) {
        const alvo = genero === 'm' ? 35 : 30;
        const restam = Math.max(0, alvo - anos);
        items.push({ label: 'Tempo Necessário (Comum)', value: `${alvo} anos`, type: 'info' });
        items.push({ label: 'Saldo de Tempo Restante', value: `${restam} anos`, type: 'pro' });
      }
      return { total: tempoFormatado, items };
    }

    return { total: grandTotalValue, items };
  }, [calcType, rows, config, percentualAdicional, genero, multiplicadorEspecial]);

  const copyAsRichTable = () => {
    let html = `<table border="1" style="border-collapse:collapse; width:100%; font-family:Inter, Arial; font-size:12px; color:#333;">`;
    html += `<tr style="background:#135bec; color:white;"><th colspan="2" style="padding:12px; text-align:center;">MEMÓRIA DE CÁLCULO - ND-CALC</th></tr>`;
    html += `<tr><td style="padding:8px; background:#f8f9fa;"><b>Cliente:</b></td><td style="padding:8px;">${clientName || '---'}</td></tr>`;
    html += `<tr><td style="padding:8px; background:#f8f9fa;"><b>Processo:</b></td><td style="padding:8px;">${processNumber || '---'}</td></tr>`;
    html += `<tr style="background:#e9ecef; font-weight:bold;"><td style="padding:10px;">DESCRIÇÃO DO ITEM</td><td style="padding:10px; text-align:right;">VALOR</td></tr>`;
    
    results.items.forEach(it => {
      const val = typeof it.value === 'number' ? it.value.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : it.value;
      html += `<tr><td style="padding:8px;">${it.label}</td><td style="padding:8px; text-align:right;">${val}</td></tr>`;
    });
    
    const finalVal = typeof results.total === 'number' ? results.total.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : results.total;
    html += `<tr style="background:#f1f3f5; font-weight:bold;"><td style="padding:12px;">TOTAL GERAL APURADO</td><td style="padding:12px; text-align:right; font-size:14px; color:#135bec;">R$ ${finalVal}</td></tr>`;
    html += `</table>`;

    const blob = new Blob([html], { type: 'text/html' });
    const data = [new ClipboardItem({ 'text/html': blob })];
    navigator.clipboard.write(data).then(() => alert('Tabela formatada pronta para o Word/Google Docs!'));
  };

  const saveCalculation = () => {
    const entry: CalculationEntry = {
      id: 'calc-' + Date.now(),
      name: `${getCalcInfo().title} - ${clientName || 'S/N'}`,
      client: clientName || 'Não Informado',
      processNumber: processNumber || '---',
      area: getCalcInfo().area,
      date: new Date().toLocaleDateString('pt-BR'),
      value: results.total,
      status: 'Completo',
      tags: []
    };
    const saved = localStorage.getItem('nd_calculations');
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem('nd_calculations', JSON.stringify([entry, ...list]));
    alert('Memória de cálculo arquivada com sucesso!');
    navigateTo(AppView.HISTORY);
  };

  const info = getCalcInfo();

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark pb-10">
      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1400px] px-8 py-8">
          
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6 border-b border-border-dark pb-8">
             <div className="flex-1">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">{info.area}</span>
                <h1 className="text-4xl font-black text-white mt-3 tracking-tight">{info.title}</h1>
                <p className="text-text-secondary text-sm mt-1 opacity-70">Preencha os dados abaixo para gerar a memória técnica.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Cliente / Parte</label>
                 <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João da Silva" className="bg-surface-dark border border-border-dark rounded-xl p-3 text-white text-sm outline-none focus:border-primary transition-all w-full sm:w-64" />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Número do Processo</label>
                 <input value={processNumber} onChange={e => setProcessNumber(e.target.value)} placeholder="0000000-00.0000.0.00.0000" className="bg-surface-dark border border-border-dark rounded-xl p-3 text-white text-sm outline-none focus:border-primary transition-all w-full sm:w-64" />
               </div>
             </div>
          </header>

          <div className="flex flex-col gap-10 lg:flex-row items-start">
            
            <div className="flex-1 flex flex-col gap-8 w-full">
              {/* Tabela de Lançamentos */}
              <div className="rounded-2xl bg-surface-dark border border-border-dark p-6 shadow-2xl relative">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Evolução dos Lançamentos
                  </h3>
                  <button onClick={addRow} className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 active:scale-95">
                    + Adicionar Período
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {rows.map((row) => (
                    <div key={row.id} className="p-5 rounded-2xl bg-background-dark/50 border border-border-dark/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 relative group animate-in fade-in duration-300">
                      {rows.length > 1 && (
                        <button onClick={() => removeRow(row.id)} className="absolute -top-2 -right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 transition-all hover:scale-110 shadow-lg">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                      
                      {/* Datas - Resolvendo sobreposição com flex e min-w */}
                      <div className="lg:col-span-4 flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">Período (Início • Fim)</label>
                        <div className="flex items-center gap-2">
                          <input type="date" value={row.start} onChange={(e) => updateRow(row.id, 'start', e.target.value)} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-primary" />
                          <span className="text-text-secondary text-xs">•</span>
                          <input type="date" value={row.end} onChange={(e) => updateRow(row.id, 'end', e.target.value)} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-primary" />
                        </div>
                      </div>

                      <div className="lg:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">
                          {calcType === CalculatorType.ATRASADOS_PREV ? 'Vlr. Devido (R$)' : 'Valor Base (R$)'}
                        </label>
                        <input type="number" value={row.baseValue} onChange={(e) => updateRow(row.id, 'baseValue', Number(e.target.value))} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-primary" />
                      </div>

                      {calcType === CalculatorType.ATRASADOS_PREV && (
                         <div className="lg:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Vlr. Pago (R$)</label>
                            <input type="number" value={row.paidValue} onChange={(e) => updateRow(row.id, 'paidValue', Number(e.target.value))} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-amber-500" />
                         </div>
                      )}

                      {(calcType === CalculatorType.ATUALIZACAO_CIVIL || calcType === CalculatorType.ATRASADOS_PREV) && (
                        <>
                          <div className={`flex flex-col gap-1.5 ${calcType === CalculatorType.ATRASADOS_PREV ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Índice</label>
                            <select value={row.index} onChange={(e) => updateRow(row.id, 'index', e.target.value)} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-emerald-500 appearance-none">
                              <option value="IPCA-E">IPCA-E</option>
                              <option value="SELIC">SELIC</option>
                              <option value="INPC">INPC</option>
                              <option value="IGP-M">IGP-M</option>
                            </select>
                          </div>
                          <div className="lg:col-span-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Juros%</label>
                            <input type="number" step="0.1" value={row.interest} onChange={(e) => updateRow(row.id, 'interest', Number(e.target.value))} className="bg-surface-dark border border-border-dark rounded-lg p-2.5 text-xs text-white w-full outline-none focus:border-emerald-500" />
                          </div>
                        </>
                      )}

                      {/* Espaçador para alinhamento quando menos campos aparecem */}
                      {calcType === CalculatorType.DESVIO_FUNCAO && <div className="lg:col-span-5"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Parâmetros Adicionais */}
              <div className="rounded-2xl bg-surface-dark border border-border-dark p-8 shadow-2xl">
                 <h3 className="text-xl font-bold text-white mb-8 border-b border-border-dark pb-4 flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary">tune</span>
                   Parâmetros Globais do Cálculo
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {calcType === CalculatorType.DESVIO_FUNCAO && (
                      <div className="flex flex-col gap-3">
                        <label className="text-xs text-text-secondary font-black uppercase tracking-widest">Percentual de Acúmulo/Desvio (%)</label>
                        <div className="relative">
                          <input type="number" value={percentualAdicional} onChange={e => setPercentualAdicional(Number(e.target.value))} className="w-full bg-background-dark border border-border-dark rounded-xl p-4 text-white text-lg font-bold outline-none focus:border-primary" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-text-secondary italic">Aplicação mensal sobre o salário base.</p>
                      </div>
                    )}
                    {(calcType === CalculatorType.TEMPO_CONTRIBUICAO || calcType === CalculatorType.PLANEJAMENTO_PREV) && (
                      <>
                        <div className="flex flex-col gap-3">
                          <label className="text-xs text-text-secondary font-black uppercase tracking-widest">Gênero do Segurado</label>
                          <div className="flex gap-2 p-1 bg-background-dark border border-border-dark rounded-xl">
                            <button onClick={() => setGenero('m')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${genero === 'm' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}>MASCULINO</button>
                            <button onClick={() => setGenero('f')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${genero === 'f' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}>FEMININO</button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="text-xs text-text-secondary font-black uppercase tracking-widest">Fator de Conversão Especial</label>
                          <input type="number" step="0.1" value={multiplicadorEspecial} onChange={e => setMultiplicadorEspecial(Number(e.target.value))} className="w-full bg-background-dark border border-border-dark rounded-xl p-4 text-white text-lg font-bold outline-none focus:border-primary" />
                          <p className="text-[10px] text-text-secondary italic">Ex: 1.4 (Homens) | 1.2 (Mulheres).</p>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2 flex flex-col gap-4">
                       <label className="flex items-center gap-4 p-5 rounded-2xl bg-background-dark/50 border border-border-dark cursor-pointer hover:bg-primary/5 transition-all group">
                         <input type="checkbox" checked={config.reflexos} onChange={() => setConfig(c => ({...c, reflexos: !c.reflexos}))} className="size-6 rounded-lg border-border-dark text-primary focus:ring-0 bg-surface-dark" />
                         <div className="flex flex-col">
                            <span className="text-base font-bold text-white group-hover:text-primary transition-colors">Ativar Reflexos Automáticos</span>
                            <span className="text-xs text-text-secondary uppercase font-medium">Projetar em DSR, 13º, Férias + 1/3, FGTS e Multas rescisórias.</span>
                         </div>
                       </label>
                       
                       <label className="flex items-center gap-4 p-5 rounded-2xl bg-background-dark/50 border border-border-dark cursor-pointer hover:bg-emerald-500/5 transition-all group">
                         <input type="checkbox" checked={config.especial} onChange={() => setConfig(c => ({...c, especial: !c.especial}))} className="size-6 rounded-lg border-border-dark text-emerald-500 focus:ring-0 bg-surface-dark" />
                         <div className="flex flex-col">
                            <span className="text-base font-bold text-white group-hover:text-emerald-500 transition-colors">Período de Atividade Especial</span>
                            <span className="text-xs text-text-secondary uppercase font-medium">Aplicar multiplicador de conversão sobre o tempo de serviço apurado.</span>
                         </div>
                       </label>
                    </div>
                 </div>
              </div>
            </div>

            {/* Sumário Lateral */}
            <div className="w-full lg:w-[440px] shrink-0">
               <div className="sticky top-8 rounded-3xl bg-surface-dark border border-border-dark overflow-hidden shadow-2xl flex flex-col">
                  <div className="bg-primary/10 p-10 border-b border-border-dark relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[3px] mb-2">Resultado Final</p>
                        <h2 className="text-4xl font-black text-primary tracking-tighter truncate">
                          {typeof results.total === 'number' ? results.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : results.total}
                        </h2>
                      </div>
                      <button onClick={copyAsRichTable} title="Copiar Tabela Formatada" className="p-3 bg-background-dark rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90 border border-border-dark">
                        <span className="material-symbols-outlined text-[28px]">content_paste_go</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-10 space-y-5 max-h-[480px] overflow-y-auto custom-scrollbar bg-surface-dark-alt/20">
                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border-dark pb-2 mb-2">Detalhamento das Verbas</h4>
                    {results.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-start gap-4 pb-4 border-b border-border-dark/30 last:border-0 group">
                        <span className="text-text-secondary text-xs font-semibold leading-relaxed group-hover:text-white transition-colors">{it.label}</span>
                        <span className="font-mono font-bold text-sm text-white whitespace-nowrap bg-background-dark/30 px-2 py-1 rounded">
                           {typeof it.value === 'number' ? it.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : it.value}
                        </span>
                      </div>
                    ))}
                    {results.items.length === 0 && (
                      <div className="py-20 text-center opacity-10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-7xl">view_list</span>
                        <p className="text-xs font-black mt-4 uppercase tracking-widest">Nenhum Lançamento</p>
                      </div>
                    )}
                  </div>

                  <div className="p-10 bg-background-dark border-t border-border-dark space-y-4">
                    <button onClick={saveCalculation} className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.97] uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined">save</span>
                      SALVAR NO HISTÓRICO
                    </button>
                    <button onClick={() => window.print()} className="w-full bg-surface-dark-alt text-white font-bold py-4 rounded-2xl border border-border-dark hover:bg-surface-dark transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                      GERAR RELATÓRIO PDF
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilo para evitar quebras visuais e sobreposição em telas pequenas */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3649;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
};

export default CalculationForm;

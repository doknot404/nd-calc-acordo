
import React, { useState, useEffect } from 'react';
import { Installment } from '../types';
import { IMAGES } from '../constants';

const AgreementSimulator: React.FC = () => {
  // Dados de Identificação
  const [clientName, setClientName] = useState('');
  const [processNumber, setProcessNumber] = useState('');

  // Valores Principais
  const [totalAction, setTotalAction] = useState<number>(100000);
  const [offeredValue, setOfferedValue] = useState<number>(60000);
  
  // Configuração de Parcelamento
  const [installmentsCount, setInstallmentsCount] = useState<number>(10);
  const [hasDifferentEntry, setHasDifferentEntry] = useState<boolean>(true);
  const [entryValue, setEntryValue] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Honorários
  const [isFeeEnabled, setIsFeeEnabled] = useState<boolean>(true);
  const [feeMode, setFeeMode] = useState<'percent' | 'fixed'>('percent');
  const [feeInput, setFeeInput] = useState<number>(20);
  const [feePaymentType, setFeePaymentType] = useState<'lumpSum' | 'installments'>('lumpSum');
  const [feeInstallmentsCount, setFeeInstallmentsCount] = useState<number>(5);

  const [installmentList, setInstallmentList] = useState<Installment[]>([]);

  // Cálculos Derivados
  const adherencePercent = (offeredValue / (totalAction || 1)) * 100;
  const legalFeeTotal = isFeeEnabled ? (feeMode === 'percent' ? (offeredValue * (feeInput / 100)) : feeInput) : 0;
  const totalCommitment = offeredValue + legalFeeTotal;

  // Lógica de geração automática de parcelas
  useEffect(() => {
    const list: Installment[] = [];
    const start = new Date(startDate + 'T12:00:00'); 
    
    let remainingAgreement = offeredValue;
    if (hasDifferentEntry && entryValue > 0) {
      list.push({ id: `agr-entry`, label: 'Entrada do Acordo', value: entryValue, date: startDate, type: 'agreement' });
      remainingAgreement -= entryValue;
    }

    const agrInstCount = Math.max(1, installmentsCount);
    const agrVal = remainingAgreement > 0 ? remainingAgreement / agrInstCount : 0;

    for (let i = 1; i <= agrInstCount; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + (hasDifferentEntry ? i : i - 1));
      list.push({ 
        id: `agr-inst-${i}`, 
        label: `Parcela Acordo ${i}/${agrInstCount}`, 
        value: agrVal, 
        date: d.toISOString().split('T')[0], 
        type: 'agreement' 
      });
    }

    if (isFeeEnabled && legalFeeTotal > 0) {
      if (feePaymentType === 'lumpSum') {
        list.push({ id: 'fee-total', label: 'Honorários (À Vista)', value: legalFeeTotal, date: startDate, type: 'fee' });
      } else {
        const feeVal = legalFeeTotal / Math.max(1, feeInstallmentsCount);
        for (let j = 1; j <= feeInstallmentsCount; j++) {
          const d = new Date(start);
          d.setMonth(start.getMonth() + j - 1);
          list.push({ 
            id: `fee-inst-${j}`, 
            label: `Parcela Honorário ${j}/${feeInstallmentsCount}`, 
            value: feeVal, 
            date: d.toISOString().split('T')[0], 
            type: 'fee' 
          });
        }
      }
    }

    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setInstallmentList(list);
  }, [offeredValue, installmentsCount, hasDifferentEntry, entryValue, startDate, legalFeeTotal, feePaymentType, feeInstallmentsCount, isFeeEnabled]);

  // Função para editar data individualmente
  const updateInstallmentDate = (id: string, newDate: string) => {
    const updatedList = installmentList.map(item => 
      item.id === id ? { ...item, date: newDate } : item
    );
    // Reordenar após edição para manter a linha do tempo
    updatedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setInstallmentList(updatedList);
  };

  const copyAsRichTable = () => {
    let html = `<table border="1" style="border-collapse:collapse; width:100%; font-family:Arial, sans-serif; font-size:12px; border: 1px solid #ddd;">`;
    html += `<tr style="background:#135bec; color:white;"><th colspan="3" style="padding:15px; text-align:center; font-size:16px;">PROPOSTA DE ACORDO EXTRAJUDICIAL</th></tr>`;
    html += `<tr><td style="padding:8px; background:#f4f7fa;"><b>Cliente:</b></td><td colspan="2" style="padding:8px;">${clientName || '---'}</td></tr>`;
    html += `<tr><td style="padding:8px; background:#f4f7fa;"><b>Processo:</b></td><td colspan="2" style="padding:8px;">${processNumber || '---'}</td></tr>`;
    html += `<tr><td style="padding:8px; background:#f4f7fa;"><b>Valor Ofertado no Acordo:</b></td><td colspan="2" style="padding:8px;">R$ ${offeredValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>`;
    html += `<tr style="background:#f1f3f5; font-weight:bold;"><td style="padding:10px;">ITEM</td><td style="padding:10px; text-align:center;">VENCIMENTO</td><td style="padding:10px; text-align:right;">VALOR</td></tr>`;
    
    installmentList.forEach(it => {
      html += `<tr><td style="padding:8px;">${it.label}</td><td style="padding:8px; text-align:center;">${it.date.split('-').reverse().join('/')}</td><td style="padding:8px; text-align:right;">${it.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>`;
    });
    
    html += `<tr style="background:#135bec; color:white; font-weight:bold;"><td colspan="2" style="padding:12px; font-size:14px;">TOTAL GERAL</td><td style="padding:12px; text-align:right; font-size:14px;">R$ ${totalCommitment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>`;
    html += `</table>`;

    const blob = new Blob([html], { type: 'text/html' });
    const data = [new ClipboardItem({ 'text/html': blob })];
    navigator.clipboard.write(data).then(() => alert('Tabela copiada para a área de transferência!'));
  };

  const clearForm = () => {
    if(confirm('Atenção: Todos os dados personalizados serão limpos. Deseja continuar?')) {
      setClientName('');
      setProcessNumber('');
      setOfferedValue(60000);
      setTotalAction(100000);
      setInstallmentsCount(10);
      setEntryValue(10000);
      setHasDifferentEntry(true);
      setIsFeeEnabled(true);
      setFeeInput(20);
      setFeeMode('percent');
      setFeePaymentType('lumpSum');
      setFeeInstallmentsCount(5);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-background-dark overflow-y-auto pb-12 scroll-smooth">
      {/* HEADER INTERATIVO (Oculto na Impressão) */}
      <header className="px-10 py-8 border-b border-border-dark flex flex-col lg:flex-row items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-5">
          <div className="bg-primary flex items-center justify-center rounded-2xl size-14 shadow-2xl shadow-primary/40 ring-4 ring-primary/10">
            <span className="material-symbols-outlined text-white text-[36px]">handshake</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Simulador de Acordos</h1>
            <p className="text-text-secondary mt-2 font-medium">Gestão profissional de propostas e honorários.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={clearForm} 
            className="flex-1 lg:flex-none px-6 h-12 rounded-xl border border-border-dark text-text-secondary font-bold hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span> LIMPAR
          </button>
          <button 
            onClick={copyAsRichTable} 
            className="flex-1 lg:flex-none px-6 h-12 rounded-xl bg-surface-dark-alt border border-border-dark text-white font-bold hover:bg-surface-dark flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">content_paste</span> COPIAR
          </button>
        </div>
      </header>

      {/* PAINEL DE IDENTIFICAÇÃO (Oculto na Impressão) */}
      <div className="px-10 mt-8 print:hidden">
        <div className="bg-surface-dark/50 border border-border-dark rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px]">Cliente</label>
            <input 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              placeholder="Digite o nome completo" 
              className="bg-background-dark border border-border-dark rounded-xl h-12 px-4 text-white outline-none focus:border-primary transition-all" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[2px]">Número do Processo</label>
            <input 
              value={processNumber} 
              onChange={e => setProcessNumber(e.target.value)} 
              placeholder="0000000-00.0000.0.00.0000" 
              className="bg-background-dark border border-border-dark rounded-xl h-12 px-4 text-white outline-none focus:border-primary font-mono transition-all" 
            />
          </div>
        </div>
      </div>

      {/* ÁREA DE TRABALHO (Oculto na Impressão) */}
      <div className="p-10 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-10 print:hidden">
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES GERAIS */}
        <div className="xl:col-span-6 space-y-8">
          
          <div className="grid grid-cols-1 gap-8">
            {/* Valores do Acordo */}
            <section className="bg-surface-dark border border-border-dark rounded-3xl p-8 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">payments</span>
                Proposta Financeira
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Valor da Lide (Causa)</label>
                  <input 
                    type="number" 
                    value={totalAction} 
                    onChange={e => setTotalAction(Number(e.target.value))} 
                    className="bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white text-lg font-bold outline-none focus:border-primary" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Valor Proposto (Acordo)</label>
                  <input 
                    type="number" 
                    value={offeredValue} 
                    onChange={e => setOfferedValue(Number(e.target.value))} 
                    className="bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white text-lg font-bold outline-none focus:border-primary" 
                  />
                </div>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase">Percentual de Redução</span>
                    <span className="text-sm text-text-secondary mt-1">Comparação estratégica</span>
                 </div>
                 <h4 className="text-4xl font-black text-white">{adherencePercent.toFixed(2)}%</h4>
              </div>
            </section>

            {/* Configurações de Tempo */}
            <section className="bg-surface-dark border border-border-dark rounded-3xl p-8 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">calendar_month</span>
                Datas e Parcelas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Início do Cronograma</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      className="bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white outline-none focus:border-emerald-500" 
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Nº de Parcelas</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      value={installmentsCount} 
                      onChange={e => setInstallmentsCount(Number(e.target.value))} 
                      className="bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white font-bold outline-none focus:border-emerald-500" 
                    />
                 </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background-dark/50 border border-border-dark rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Entrada Especial?</span>
                  <span className="text-[10px] text-text-secondary">Defina um valor diferente para o 1º pagamento</span>
                </div>
                <button 
                  onClick={() => setHasDifferentEntry(!hasDifferentEntry)} 
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${hasDifferentEntry ? 'bg-emerald-500' : 'bg-surface-dark-alt'}`}
                >
                  <div className={`absolute top-1 size-5 bg-white rounded-full transition-all duration-300 ${hasDifferentEntry ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              {hasDifferentEntry && (
                <div className="flex flex-col gap-2 animate-in zoom-in-95 duration-300">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Valor da Entrada (R$)</label>
                  <input 
                    type="number" 
                    value={entryValue} 
                    onChange={e => setEntryValue(Number(e.target.value))} 
                    className="bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white font-bold outline-none focus:border-emerald-500" 
                  />
                </div>
              )}
            </section>
          </div>

          {/* Honorários */}
          <section className="bg-surface-dark border border-border-dark rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-dark pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
                  <span className="material-symbols-outlined text-3xl font-variation-fill">gavel</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Honorários</h3>
                  <p className="text-sm text-text-secondary">Cálculo da verba advocatícia.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFeeEnabled(!isFeeEnabled)} 
                className={`w-16 h-8 rounded-full relative transition-all duration-300 ${isFeeEnabled ? 'bg-amber-500 ring-4 ring-amber-500/10' : 'bg-surface-dark-alt'}`}
              >
                <div className={`absolute top-1.5 size-5 bg-white rounded-full transition-all duration-300 ${isFeeEnabled ? 'right-1.5' : 'left-1.5'}`}></div>
              </button>
            </div>

            {isFeeEnabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Base</label>
                  <div className="flex gap-2 p-1.5 bg-background-dark border border-border-dark rounded-2xl">
                    <button onClick={() => setFeeMode('percent')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${feeMode === 'percent' ? 'bg-amber-500 text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}>%</button>
                    <button onClick={() => setFeeMode('fixed')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${feeMode === 'fixed' ? 'bg-amber-500 text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}>R$</button>
                  </div>
                  <input 
                    type="number" 
                    value={feeInput} 
                    onChange={e => setFeeInput(Number(e.target.value))} 
                    className="w-full bg-background-dark border border-border-dark rounded-xl h-14 px-5 text-white text-lg font-bold outline-none focus:border-amber-500" 
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Vencimento</label>
                  <div className="flex gap-3 h-[72px]">
                    <button onClick={() => setFeePaymentType('lumpSum')} className={`flex-1 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-bold text-xs uppercase ${feePaymentType === 'lumpSum' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border-dark text-text-secondary hover:border-amber-500/30'}`}>
                      <span className="material-symbols-outlined text-lg">bolt</span>
                      <span>À Vista</span>
                    </button>
                    <button onClick={() => setFeePaymentType('installments')} className={`flex-1 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-bold text-xs uppercase ${feePaymentType === 'installments' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border-dark text-text-secondary hover:border-amber-500/30'}`}>
                      <span className="material-symbols-outlined text-lg">reorder</span>
                      <span>Parcelas</span>
                    </button>
                  </div>
                  {feePaymentType === 'installments' && (
                    <input 
                      type="number" 
                      min="1" 
                      value={feeInstallmentsCount} 
                      onChange={e => setFeeInstallmentsCount(Number(e.target.value))} 
                      className="bg-background-dark border border-border-dark rounded-xl h-12 px-4 text-white font-bold outline-none focus:border-amber-500" 
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUNA DIREITA: CRONOGRAMA INTERATIVO */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="bg-surface-dark border border-border-dark rounded-3xl p-10 h-full flex flex-col shadow-2xl">
              <div className="mb-10 border-b border-border-dark pb-8 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-white">Linha do Tempo</h3>
                    <p className="text-xs text-text-secondary mt-1">Edite as datas clicando nos campos abaixo.</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Global</span>
                    <h4 className="text-3xl font-black text-primary">R$ {totalCommitment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                 </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                {installmentList.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${item.type === 'fee' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-background-dark/40 border-border-dark/60'}`}>
                    <div className="flex flex-col gap-2 flex-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${item.type === 'fee' ? 'text-amber-500' : 'text-text-secondary'}`}>
                        {item.label}
                      </span>
                      <div className="relative w-max">
                        <input 
                          type="date"
                          value={item.date}
                          onChange={(e) => updateInstallmentDate(item.id, e.target.value)}
                          className="bg-transparent border-none p-0 text-white font-bold text-lg outline-none cursor-pointer hover:text-primary transition-colors focus:ring-0"
                        />
                        <span className="material-symbols-outlined text-xs absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 text-white">edit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-mono font-bold ${item.type === 'fee' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-border-dark grid grid-cols-2 gap-6">
                   <div className="p-6 rounded-2xl bg-background-dark/30 border border-border-dark">
                      <span className="text-[10px] font-black text-text-secondary uppercase">Principal</span>
                      <p className="text-xl font-bold text-white">R$ {offeredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-background-dark/30 border border-border-dark">
                      <span className="text-[10px] font-black text-amber-500 uppercase">Honorários</span>
                      <p className="text-xl font-bold text-white">R$ {legalFeeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   </div>
              </div>
           </div>
        </div>
      </div>

      <style>{`
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
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
          }
          main { 
            overflow: visible !important; 
            height: auto !important; 
            position: static !important; 
          }
          .material-symbols-outlined { 
            font-family: 'Material Symbols Outlined' !important; 
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            display: none;
            -webkit-appearance: none;
          }
        }
      `}</style>
    </main>
  );
};

export default AgreementSimulator;


// Definição dos enums de visualização e tipos de calculadoras para navegação e lógica de negócio

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  AGREEMENT_SIMULATOR = 'AGREEMENT_SIMULATOR',
  TRABALHISTA_HUB = 'TRABALHISTA_HUB',
  CIVIL_HUB = 'CIVIL_HUB',
  PREVIDENCIARIO_HUB = 'PREVIDENCIARIO_HUB',
  SETTINGS = 'SETTINGS',
  HELP = 'HELP',
  AREA_SELECTION = 'AREA_SELECTION',
  CALCULATION_FORM = 'CALCULATION_FORM',
  EXPORT_PDF = 'EXPORT_PDF',
}

export enum CalculatorType {
  RESCISAO = 'RESCISAO',
  HORAS_EXTRAS = 'HORAS_EXTRAS',
  DIFERENCA_SALARIAL = 'DIFERENCA_SALARIAL',
  DESVIO_FUNCAO = 'DESVIO_FUNCAO',
  INSALUBRIDADE = 'INSALUBRIDADE',
  PERICULOSIDADE = 'PERICULOSIDADE',
  FGTS_ATRASO = 'FGTS_ATRASO',
  ADICIONAL_NOTURNO = 'ADICIONAL_NOTURNO',
  ATUALIZACAO_CIVIL = 'ATUALIZACAO_CIVIL',
  ATRASADOS_PREV = 'ATRASADOS_PREV',
  PLANEJAMENTO_PREV = 'PLANEJAMENTO_PREV',
  TEMPO_CONTRIBUICAO = 'TEMPO_CONTRIBUICAO',
  RMI_PREV = 'RMI_PREV',
}

export interface CalculationEntry {
  id: string;
  name: string;
  client: string;
  processNumber: string;
  area: string;
  date: string;
  value: number | string;
  status: string;
  tags: string[];
}

export interface Installment {
  id: string;
  label: string;
  value: number;
  date: string;
  type: 'agreement' | 'fee';
}

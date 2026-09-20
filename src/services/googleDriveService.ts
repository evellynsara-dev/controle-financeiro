import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, FinancialSummary, CategoryBudget, Member } from '../types';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive & Sheets Scopes
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Cache the access token in memory only (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleDriveConfig {
  spreadsheetId: string | null;
  spreadsheetName: string;
  spreadsheetUrl: string | null;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string;
  autoSync: boolean;
  syncCount: number;
}

const STORAGE_KEY = 'cf_google_drive_sheets_config';

export const DEFAULT_DRIVE_CONFIG: GoogleDriveConfig = {
  spreadsheetId: null,
  spreadsheetName: 'Controle Financeiro - Backup Google Drive',
  spreadsheetUrl: null,
  lastSyncAt: null,
  syncStatus: 'idle',
  autoSync: false,
  syncCount: 0,
};

export const getGoogleDriveConfig = (): GoogleDriveConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_DRIVE_CONFIG;
    return { ...DEFAULT_DRIVE_CONFIG, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_DRIVE_CONFIG;
  }
};

export const saveGoogleDriveConfig = (config: GoogleDriveConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Erro ao salvar configuração do Google Drive:', err);
  }
};

// Listen for Auth Changes
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthSignOut?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthSignOut) onAuthSignOut();
    }
  });
};

// Sign in with Google (Popup)
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso da sua conta Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro no login do Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Get current in-memory access token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

// =========================================================================
// GOOGLE DRIVE & GOOGLE SHEETS API OPERATIONS
// =========================================================================

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

/**
 * List spreadsheets created in Google Drive by this app or matching the name
 */
export const listDriveSpreadsheets = async (
  token: string
): Promise<DriveSpreadsheetItem[]> => {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=15&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Falha ao listar arquivos do Google Drive (${response.status})`
    );
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Create a fresh Google Spreadsheet directly in the user's Google Drive
 */
export const createGoogleDriveSpreadsheet = async (
  token: string,
  title: string
): Promise<{ id: string; url: string }> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const body = {
    properties: {
      title: title || 'Controle Financeiro - Backup Google Drive',
    },
    sheets: [
      { properties: { title: 'Resumo' } },
      { properties: { title: 'Transações' } },
      { properties: { title: 'Contas a Pagar' } },
      { properties: { title: 'Orçamentos' } },
      { properties: { title: 'Membros' } },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Erro ao criar planilha no Google Drive (${response.status})`
    );
  }

  const data = await response.json();
  const id = data.spreadsheetId;
  const webViewLink =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  return { id, url: webViewLink };
};

/**
 * Ensure the required sheets exist in an existing spreadsheet
 */
const ensureSheetsExist = async (
  token: string,
  spreadsheetId: string,
  requiredTitles: string[]
) => {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) return; // Ignore if permission or not found

  const metaData = await metaRes.json();
  const existingTitles = new Set(
    (metaData.sheets || []).map((s: any) => s.properties?.title)
  );

  const missing = requiredTitles.filter((title) => !existingTitles.has(title));
  if (missing.length === 0) return;

  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const requests = missing.map((title) => ({
    addSheet: {
      properties: { title },
    },
  }));

  await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
};

/**
 * Synchronize all financial data into the Google Sheets spreadsheet in Google Drive
 */
export const syncFinancialDataToSheets = async (
  token: string,
  spreadsheetId: string,
  transactions: Transaction[],
  summary: FinancialSummary,
  budgets: CategoryBudget[],
  members: Member[],
  periodName: string
): Promise<{ success: boolean; message: string; updatedSheetsCount: number }> => {
  // 1. Ensure sheets exist
  const sheetNames = ['Resumo', 'Transações', 'Contas a Pagar', 'Orçamentos', 'Membros'];
  await ensureSheetsExist(token, spreadsheetId, sheetNames);

  // 2. Clear old data to prevent stale leftover rows
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        'Resumo!A1:Z100',
        'Transações!A1:Z3000',
        "'Contas a Pagar'!A1:Z2000",
        'Orçamentos!A1:Z200',
        'Membros!A1:Z100',
      ],
    }),
  });

  // 3. Build data payloads
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  // Sheet: Resumo
  const resumoValues: any[][] = [
    ['CONTROLE FINANCEIRO COMPARTILHADO - GOOGLE DRIVE & PLANILHAS'],
    ['Período de Competência:', periodName],
    ['Último Backup em Tempo Real:', new Date().toLocaleString('pt-BR')],
    ['Armazenado em:', 'Google Drive Pessoal (via Login Google)'],
    [''],
    ['INDICADOR FINANCEIRO', 'VALOR (R$)', 'STATUS / DETALHE'],
    ['Entradas Recebidas', summary.entradasTotal, 'Receitas confirmadas no mês'],
    ['Saídas Pagas', summary.saidasTotal, 'Despesas quitadas'],
    ['Falta Pagar (Pendentes)', summary.faltaPagarTotal, 'Contas e faturas a vencer'],
    ['Falta Receber (Esperado)', summary.faltaReceberTotal, 'Recebimentos previstos'],
    [''],
    ['SALDO ATUAL EM CAIXA', summary.saldoAtual, summary.saldoAtual >= 0 ? 'Positivo' : 'Negativo'],
    ['SALDO PROJETADO FINAL', summary.saldoProjetado, summary.saldoProjetado >= 0 ? 'Superávit' : 'Déficit'],
    ['TAXA DE ECONOMIA', `${summary.taxaPoupanca.toFixed(1)}%`, 'Margem poupada'],
    ['FATURAS EM ATRASO', summary.faturasVencidasTotal, `${summary.faturasVencidasCount} conta(s) em atraso`],
  ];

  // Sheet: Transações
  const txHeader = [
    'ID',
    'Tipo',
    'Descrição',
    'Valor (R$)',
    'Categoria',
    'Data Competência',
    'Vencimento',
    'Data Pagamento',
    'Status',
    'Responsável',
    'Conta',
    'Modo Pagamento',
    'Parcela',
    'Multa Prevista (R$)',
    'Cartão de Crédito',
    'Código de Barras',
    'Observações',
  ];

  const txValues: any[][] = [
    txHeader,
    ...transactions.map((t) => [
      t.id,
      t.type === 'entrada'
        ? 'Receita'
        : t.type === 'saida'
        ? 'Despesa'
        : t.type === 'falta_pagar'
        ? 'Falta Pagar'
        : 'Falta Receber',
      t.description,
      t.amount,
      t.category,
      t.date,
      t.dueDate || '',
      t.paidDate || '',
      t.status.toUpperCase(),
      memberMap.get(t.memberId) || 'Geral',
      t.account,
      t.paymentMode === 'parcelado'
        ? 'Parcelado'
        : t.paymentMode === 'recorrente'
        ? 'Recorrente'
        : 'À Vista',
      t.paymentMode === 'parcelado' && t.installmentTotal
        ? `${t.installmentCurrent || 1}/${t.installmentTotal}`
        : '',
      t.finePenaltyEstimated || 0,
      t.isCreditCard ? 'Sim' : 'Não',
      t.invoiceBarcode || '',
      t.notes || '',
    ]),
  ];

  // Sheet: Contas a Pagar
  const pagarHeader = [
    'Conta / Fatura',
    'Valor (R$)',
    'Vencimento',
    'Status',
    'Responsável',
    'Categoria',
    'Conta',
    'Multa Estimada (R$)',
    'Código de Barras / Linha Digitável',
    'Observações',
  ];

  const pendencias = transactions.filter((t) => t.type === 'falta_pagar');
  const pagarValues: any[][] = [
    pagarHeader,
    ...pendencias.map((t) => [
      t.description,
      t.amount,
      t.dueDate || '',
      t.status.toUpperCase(),
      memberMap.get(t.memberId) || 'Geral',
      t.category,
      t.account,
      t.finePenaltyEstimated || 0,
      t.invoiceBarcode || '',
      t.notes || '',
    ]),
  ];

  // Sheet: Orçamentos
  const orcamentoHeader = [
    'Categoria',
    'Limite Mensal (R$)',
    'Gasto / Comprometido (R$)',
    'Saldo Disponível (R$)',
    '% Utilizado',
    'Situação',
  ];

  const despesaBudgets = budgets.filter((b) => b.type === 'despesa');
  const orcamentoValues: any[][] = [
    orcamentoHeader,
    ...despesaBudgets.map((b) => {
      const gasto = transactions
        .filter((t) => t.category === b.category && (t.type === 'saida' || t.type === 'falta_pagar'))
        .reduce((sum, item) => sum + item.amount, 0);
      const saldo = b.monthlyLimit - gasto;
      const pct = b.monthlyLimit > 0 ? ((gasto / b.monthlyLimit) * 100).toFixed(1) : '0.0';
      const situacao =
        gasto > b.monthlyLimit
          ? 'ESTOURADO'
          : gasto > b.monthlyLimit * 0.85
          ? 'ALERTA'
          : 'DENTRO DO LIMITE';
      return [b.category, b.monthlyLimit, gasto, saldo, `${pct}%`, situacao];
    }),
  ];

  // Sheet: Membros
  const membrosHeader = ['ID', 'Nome', 'Papel', 'E-mail', 'Telefone'];
  const membrosValues: any[][] = [
    membrosHeader,
    ...members.map((m) => [m.id, m.name, m.role, m.email || '', m.phone || '']),
  ];

  // 4. Batch update values to Google Sheets
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const updatePayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: 'Resumo!A1', values: resumoValues },
      { range: 'Transações!A1', values: txValues },
      { range: "'Contas a Pagar'!A1", values: pagarValues },
      { range: 'Orçamentos!A1', values: orcamentoValues },
      { range: 'Membros!A1', values: membrosValues },
    ],
  };

  const updateResponse = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  });

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Erro ao gravar dados na planilha do Google (${updateResponse.status})`
    );
  }

  return {
    success: true,
    message: `Planilha atualizada com sucesso no Google Drive (${transactions.length} lançamentos)!`,
    updatedSheetsCount: 5,
  };
};

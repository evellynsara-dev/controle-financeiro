import { Member, CategoryBudget, Transaction, GoogleSheetsConfig, ProfileMode, PaymentAccount } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase Configuration from Vite Environment Variables
export const SUPABASE_URL: string = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const SUPABASE_ANON_KEY: string = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let _supabaseClient: SupabaseClient | null = null;

/**
 * Returns the initialized Supabase client singleton, or null if configuration is missing.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (_supabaseClient) return _supabaseClient;
  if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')) {
    try {
      _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
        },
      });
    } catch (err) {
      console.warn('Falha ao inicializar o Supabase client:', err);
      _supabaseClient = null;
    }
  }
  return _supabaseClient;
};

/**
 * Direct alias for the Supabase client
 */
export const supabase = getSupabaseClient();

/**
 * Checks if Supabase credentials are validly supplied
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'fin_control_transactions_v1',
  MEMBERS: 'fin_control_members_v1',
  BUDGETS: 'fin_control_budgets_v1',
  ACCOUNTS: 'fin_control_accounts_v1',
  SHEETS_CONFIG: 'fin_control_sheets_v1',
  PROFILE_MODE: 'fin_control_profile_mode_v1',
};

// Initial default payment accounts
export const DEFAULT_ACCOUNTS: Record<ProfileMode, PaymentAccount[]> = {
  familia: [
    { id: 'acc-1', name: 'Conta Corrente Itaú', type: 'conta_corrente', color: '#f97316' },
    { id: 'acc-2', name: 'Cartão Nubank', type: 'cartao_credito', closingDay: 18, dueDay: 25, creditLimit: 6500, color: '#8b5cf6' },
    { id: 'acc-3', name: 'Cartão XP Visa Infinite', type: 'cartao_credito', closingDay: 10, dueDay: 18, creditLimit: 12000, color: '#0f172a' },
    { id: 'acc-4', name: 'Conta Poupança & Reserva', type: 'poupanca_investimento', color: '#10b981' },
    { id: 'acc-5', name: 'Dinheiro em Espécie / Carteira', type: 'dinheiro_caixa', color: '#64748b' },
  ],
  empresa: [
    { id: 'acc-1', name: 'Conta Corrente Inter PJ', type: 'conta_corrente', color: '#f97316' },
    { id: 'acc-2', name: 'Cartão Corporativo C6', type: 'cartao_credito', closingDay: 15, dueDay: 22, creditLimit: 25000, color: '#1e293b' },
    { id: 'acc-3', name: 'Caixa Empresa / Dinheiro', type: 'dinheiro_caixa', color: '#10b981' },
    { id: 'acc-4', name: 'Aplicação Financeira CDB', type: 'poupanca_investimento', color: '#06b6d4' },
  ]
};

// Initial default members
export const DEFAULT_MEMBERS: Record<ProfileMode, Member[]> = {
  familia: [
    { id: 'm1', name: 'Carlos Silva (Pai)', role: 'Administrador', color: '#2563eb', avatar: '👨‍💼', email: 'carlos@familia.com', phone: '+55 11 98765-4321' },
    { id: 'm2', name: 'Mariana Silva (Mãe)', role: 'Administrador', color: '#db2777', avatar: '👩‍💼', email: 'mariana@familia.com', phone: '+55 11 98888-1122' },
    { id: 'm3', name: 'Lucas Silva (Filho)', role: 'Familiar', color: '#10b981', avatar: '👦', email: 'lucas@familia.com' },
    { id: 'm4', name: 'Beatriz Silva (Filha)', role: 'Familiar', color: '#8b5cf6', avatar: '👧', email: 'beatriz@familia.com' },
  ],
  empresa: [
    { id: 'm1', name: 'Roberto Mendes (Diretor)', role: 'Sócio', color: '#2563eb', avatar: '👔', email: 'roberto@empresa.com', phone: '+55 11 99111-2233' },
    { id: 'm2', name: 'Juliana Costa (Financeiro)', role: 'Financeiro', color: '#059669', avatar: '💼', email: 'juliana@empresa.com', phone: '+55 11 99222-3344' },
    { id: 'm3', name: 'Felipe Rocha (Operações)', role: 'Membro', color: '#d97706', avatar: '💻', email: 'felipe@empresa.com' },
  ]
};

// Initial category budgets
export const DEFAULT_BUDGETS: Record<ProfileMode, CategoryBudget[]> = {
  familia: [
    { id: 'b1', category: 'Moradia & Contas', monthlyLimit: 2800, color: '#3b82f6', icon: 'Home', type: 'despesa' },
    { id: 'b2', category: 'Alimentação & Mercado', monthlyLimit: 2200, color: '#10b981', icon: 'ShoppingBag', type: 'despesa' },
    { id: 'b3', category: 'Transporte & Combustível', monthlyLimit: 900, color: '#f59e0b', icon: 'Car', type: 'despesa' },
    { id: 'b4', category: 'Saúde & Farmácia', monthlyLimit: 600, color: '#ef4444', icon: 'HeartPulse', type: 'despesa' },
    { id: 'b5', category: 'Educação & Cursos', monthlyLimit: 1400, color: '#8b5cf6', icon: 'GraduationCap', type: 'despesa' },
    { id: 'b6', category: 'Lazer & Viagens', monthlyLimit: 800, color: '#ec4899', icon: 'Palmtree', type: 'despesa' },
    { id: 'b7', category: 'Salários & Rendas', monthlyLimit: 12000, color: '#10b981', icon: 'Wallet', type: 'receita' },
  ],
  empresa: [
    { id: 'b1', category: 'Fornecedores & Estoque', monthlyLimit: 15000, color: '#3b82f6', icon: 'Truck', type: 'despesa' },
    { id: 'b2', category: 'Folha de Pagamento', monthlyLimit: 22000, color: '#8b5cf6', icon: 'Users', type: 'despesa' },
    { id: 'b3', category: 'Impostos & Tributos', monthlyLimit: 4500, color: '#ef4444', icon: 'Receipt', type: 'despesa' },
    { id: 'b4', category: 'Marketing & Vendas', monthlyLimit: 3000, color: '#f59e0b', icon: 'Megaphone', type: 'despesa' },
    { id: 'b5', category: 'Infraestrutura & Softwares', monthlyLimit: 2200, color: '#06b6d4', icon: 'Server', type: 'despesa' },
    { id: 'b6', category: 'Faturamento de Vendas', monthlyLimit: 55000, color: '#10b981', icon: 'TrendingUp', type: 'receita' },
  ]
};

// Helper to get formatted current dates
function getSampleDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

export const getInitialTransactions = (mode: ProfileMode): Transaction[] => {
  if (mode === 'familia') {
    return [
      // ENTRADAS
      {
        id: 'tx-1',
        description: 'Salário Mensal Carlos',
        amount: 7200,
        type: 'entrada',
        category: 'Salários & Rendas',
        date: getSampleDate(-14),
        paidDate: getSampleDate(-14),
        memberId: 'm1',
        account: 'Conta Corrente Itaú',
        status: 'pago',
        notes: 'Crédito em conta salário',
      },
      {
        id: 'tx-2',
        description: 'Salário Mariana + Bonificação',
        amount: 5400,
        type: 'entrada',
        category: 'Salários & Rendas',
        date: getSampleDate(-12),
        paidDate: getSampleDate(-12),
        memberId: 'm2',
        account: 'Conta Nubank',
        status: 'pago',
        notes: 'Salário empresa de tecnologia',
      },
      {
        id: 'tx-3',
        description: 'Rendimento de Aluguel de Imóvel',
        amount: 1850,
        type: 'entrada',
        category: 'Salários & Rendas',
        date: getSampleDate(-5),
        paidDate: getSampleDate(-5),
        memberId: 'm1',
        account: 'Conta Poupança',
        status: 'pago',
      },

      // SAÍDAS
      {
        id: 'tx-4',
        description: 'Supermercado Mensal Pão de Açúcar',
        amount: 1240.50,
        type: 'saida',
        category: 'Alimentação & Mercado',
        date: getSampleDate(-8),
        paidDate: getSampleDate(-8),
        memberId: 'm2',
        account: 'Cartão de Crédito',
        status: 'pago',
      },
      {
        id: 'tx-5',
        description: 'Combustível Posto Shell',
        amount: 280,
        type: 'saida',
        category: 'Transporte & Combustível',
        date: getSampleDate(-6),
        paidDate: getSampleDate(-6),
        memberId: 'm1',
        account: 'Cartão de Débito',
        status: 'pago',
      },
      {
        id: 'tx-6',
        description: 'Mensalidade Escolar Lucas',
        amount: 1100,
        type: 'saida',
        category: 'Educação & Cursos',
        date: getSampleDate(-9),
        paidDate: getSampleDate(-9),
        memberId: 'm1',
        account: 'Conta Corrente Itaú',
        status: 'pago',
      },
      {
        id: 'tx-7',
        description: 'Farmácia Droga Raia',
        amount: 185.30,
        type: 'saida',
        category: 'Saúde & Farmácia',
        date: getSampleDate(-3),
        paidDate: getSampleDate(-3),
        memberId: 'm2',
        account: 'Cartão Nubank',
        status: 'pago',
      },
      {
        id: 'tx-8',
        description: 'Jantar Família Restaurante',
        amount: 340,
        type: 'saida',
        category: 'Lazer & Viagens',
        date: getSampleDate(-2),
        paidDate: getSampleDate(-2),
        memberId: 'm1',
        account: 'Cartão de Crédito',
        status: 'pago',
      },

      // FALTA PAGAR (Contas pendentes com alerta de vencimento)
      {
        id: 'tx-9',
        description: 'Aluguel do Apartamento + Condomínio',
        amount: 2350,
        type: 'falta_pagar',
        category: 'Moradia & Contas',
        date: getSampleDate(0),
        dueDate: getSampleDate(0), // VENCE HOJE!
        memberId: 'm1',
        account: 'Conta Corrente Itaú',
        status: 'pendente',
        notes: 'Boleto registrado no DDA. Multa de 2% + 1% juros a.m. se atrasar!',
        finePenaltyEstimated: 47.00,
        invoiceBarcode: '34191.79001 01043.510047 91020.150008 8 98450000235000',
      },
      {
        id: 'tx-10',
        description: 'Fatura Cartão de Crédito Nubank',
        amount: 1420.80,
        type: 'falta_pagar',
        category: 'Alimentação & Mercado',
        date: getSampleDate(0),
        dueDate: getSampleDate(2), // Vence em 2 dias!
        memberId: 'm2',
        account: 'Cartão Nubank',
        status: 'pendente',
        notes: 'Compras gerais do mês',
        finePenaltyEstimated: 28.41,
      },
      {
        id: 'tx-11',
        description: 'Conta de Energia Enel',
        amount: 295.40,
        type: 'falta_pagar',
        category: 'Moradia & Contas',
        date: getSampleDate(-5),
        dueDate: getSampleDate(-1), // ATRASADO 1 DIA! ALERTA DE MULTA
        memberId: 'm1',
        account: 'Débito Automático',
        status: 'atrasado',
        notes: 'ATENÇÃO: Venceu ontem! Pagar com urgência para evitar cortes e encargos.',
        finePenaltyEstimated: 12.00,
      },
      {
        id: 'tx-12',
        description: 'Plano de Saúde Familiar',
        amount: 980,
        type: 'falta_pagar',
        category: 'Saúde & Farmácia',
        date: getSampleDate(0),
        dueDate: getSampleDate(6), // Vence em 6 dias
        memberId: 'm1',
        account: 'Conta Corrente Itaú',
        status: 'pendente',
      },

      // FALTA RECEBER
      {
        id: 'tx-13',
        description: 'Reembolso Consulta Médica Amil',
        amount: 350,
        type: 'falta_receber',
        category: 'Saúde & Farmácia',
        date: getSampleDate(0),
        dueDate: getSampleDate(4),
        memberId: 'm2',
        account: 'Conta Nubank',
        status: 'pendente',
        notes: 'Pedido de reembolso aprovado, prazo de 5 dias úteis',
      },
      {
        id: 'tx-14',
        description: 'Consultoria Freelancer Mariana',
        amount: 2100,
        type: 'falta_receber',
        category: 'Salários & Rendas',
        date: getSampleDate(0),
        dueDate: getSampleDate(7),
        memberId: 'm2',
        account: 'Conta Corrente',
        status: 'pendente',
        notes: 'Entrega final da consultoria de UX',
      }
    ];
  } else {
    // EMPRESA
    return [
      {
        id: 'tx-e1',
        description: 'Contrato Mensal Cliente Alpha Tech',
        amount: 18500,
        type: 'entrada',
        category: 'Faturamento de Vendas',
        date: getSampleDate(-10),
        paidDate: getSampleDate(-10),
        memberId: 'm1',
        account: 'Conta PJ Banco Inter',
        status: 'pago',
      },
      {
        id: 'tx-e2',
        description: 'Desenvolvimento Sistema Web Beta',
        amount: 14200,
        type: 'entrada',
        category: 'Faturamento de Vendas',
        date: getSampleDate(-5),
        paidDate: getSampleDate(-5),
        memberId: 'm2',
        account: 'Conta PJ Banco Inter',
        status: 'pago',
      },
      {
        id: 'tx-e3',
        description: 'Servidores AWS & Cloud Run',
        amount: 1450,
        type: 'saida',
        category: 'Infraestrutura & Softwares',
        date: getSampleDate(-7),
        paidDate: getSampleDate(-7),
        memberId: 'm3',
        account: 'Cartão Corporativo',
        status: 'pago',
      },
      {
        id: 'tx-e4',
        description: 'Campanha Google Ads & Meta',
        amount: 1800,
        type: 'saida',
        category: 'Marketing & Vendas',
        date: getSampleDate(-4),
        paidDate: getSampleDate(-4),
        memberId: 'm2',
        account: 'Cartão Corporativo',
        status: 'pago',
      },
      {
        id: 'tx-e5',
        description: 'DAS Simples Nacional (Impostos)',
        amount: 3200,
        type: 'falta_pagar',
        category: 'Impostos & Tributos',
        date: getSampleDate(0),
        dueDate: getSampleDate(1), // Vence amanhã!
        memberId: 'm2',
        account: 'Conta PJ Banco Inter',
        status: 'pendente',
        notes: 'Guia Simples Nacional código 1102. Juros de mora diários se atrasar.',
        finePenaltyEstimated: 64.00,
      },
      {
        id: 'tx-e6',
        description: 'Folha Adiantamento Salarial',
        amount: 8500,
        type: 'falta_pagar',
        category: 'Folha de Pagamento',
        date: getSampleDate(0),
        dueDate: getSampleDate(3),
        memberId: 'm2',
        account: 'Conta PJ Banco Inter',
        status: 'pendente',
      },
      {
        id: 'tx-e7',
        description: 'Nota Fiscal 1042 - Licenciamento de Software',
        amount: 9800,
        type: 'falta_receber',
        category: 'Faturamento de Vendas',
        date: getSampleDate(0),
        dueDate: getSampleDate(5),
        memberId: 'm1',
        account: 'Conta PJ Banco Inter',
        status: 'pendente',
      }
    ];
  }
};

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  scriptUrl: '',
  sheetId: 'Controle_Financeiro_Compartilhado_2026',
  autoSync: false,
  lastSyncAt: null,
  syncStatus: 'idle',
  syncCount: 0,
};

// Storage Operations
export const getProfileMode = (): ProfileMode => {
  const saved = localStorage.getItem(STORAGE_KEYS.PROFILE_MODE);
  return (saved === 'empresa' ? 'empresa' : 'familia');
};

export const setProfileMode = (mode: ProfileMode): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE_MODE, mode);
};

export const getTransactions = (mode: ProfileMode): Transaction[] => {
  const key = `${STORAGE_KEYS.TRANSACTIONS}_${mode}`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const initial = getInitialTransactions(mode);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing transactions', e);
    return getInitialTransactions(mode);
  }
};

// --- SUPABASE DATA MAPPERS & UTILITIES ---

export const mapTransactionToSupabaseRow = (t: Transaction, mode: ProfileMode) => ({
  id: t.id,
  profile_mode: mode,
  description: t.description,
  amount: Number(t.amount) || 0,
  type: t.type, // 'entrada' (receita), 'saida' (despesa), 'falta_pagar', 'falta_receber'
  category: t.category,
  date: t.date,
  due_date: t.dueDate || null,
  paid_date: t.paidDate || null,
  member_id: t.memberId,
  account: t.account,
  status: t.status,
  notes: t.notes || null,
  fine_penalty_estimated: t.finePenaltyEstimated ? Number(t.finePenaltyEstimated) : 0,
  invoice_barcode: t.invoiceBarcode || null,
  payment_mode: t.paymentMode || 'unico',
  installment_current: t.installmentCurrent || null,
  installment_total: t.installmentTotal || null,
  installment_group_id: t.installmentGroupId || null,
  recurrence_frequency: t.recurrenceFrequency || null,
  is_credit_card: Boolean(t.isCreditCard),
  updated_at: new Date().toISOString(),
});

const VALID_MEMBER_ROLES: Member['role'][] = ['Administrador', 'Membro', 'Sócio', 'Financeiro', 'Familiar'];
const VALID_TX_TYPES: Transaction['type'][] = ['entrada', 'saida', 'falta_pagar', 'falta_receber'];
const VALID_TX_STATUS: Transaction['status'][] = ['pago', 'pendente', 'atrasado'];
const VALID_PAYMENT_MODES: NonNullable<Transaction['paymentMode']>[] = ['unico', 'recorrente', 'parcelado'];
const VALID_ACCOUNT_TYPES: PaymentAccount['type'][] = ['cartao_credito', 'conta_corrente', 'dinheiro_caixa', 'poupanca_investimento', 'outros'];

export const mapSupabaseRowToTransaction = (row: any): Transaction => {
  const rowType = row.type as Transaction['type'];
  const type: Transaction['type'] = VALID_TX_TYPES.includes(rowType) ? rowType : 'saida';

  const rowStatus = row.status as Transaction['status'];
  const status: Transaction['status'] = VALID_TX_STATUS.includes(rowStatus) ? rowStatus : 'pendente';

  const rawPaymentMode = (row.payment_mode ?? row.paymentMode) as NonNullable<Transaction['paymentMode']>;
  const paymentMode = VALID_PAYMENT_MODES.includes(rawPaymentMode) ? rawPaymentMode : 'unico';

  return {
    id: String(row.id),
    description: String(row.description || ''),
    amount: Number(row.amount) || 0,
    type,
    category: row.category || 'Geral',
    date: row.date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date ?? row.dueDate ?? undefined,
    paidDate: row.paid_date ?? row.paidDate ?? undefined,
    memberId: row.member_id ?? row.memberId ?? 'm1',
    account: row.account || 'Conta Principal',
    status,
    notes: row.notes || undefined,
    finePenaltyEstimated: row.fine_penalty_estimated !== undefined && row.fine_penalty_estimated !== null
      ? Number(row.fine_penalty_estimated)
      : row.finePenaltyEstimated !== undefined ? Number(row.finePenaltyEstimated) : undefined,
    invoiceBarcode: row.invoice_barcode ?? row.invoiceBarcode ?? undefined,
    paymentMode,
    installmentCurrent: row.installment_current ?? row.installmentCurrent ?? undefined,
    installmentTotal: row.installment_total ?? row.installmentTotal ?? undefined,
    installmentGroupId: row.installment_group_id ?? row.installmentGroupId ?? undefined,
    recurrenceFrequency: row.recurrence_frequency ?? row.recurrenceFrequency ?? undefined,
    isCreditCard: Boolean(row.is_credit_card ?? row.isCreditCard),
  };
};

export const mapMemberToSupabaseRow = (m: Member, mode: ProfileMode) => ({
  id: m.id,
  profile_mode: mode,
  name: m.name,
  role: m.role,
  color: m.color,
  avatar: m.avatar,
  email: m.email || null,
  phone: m.phone || null,
  updated_at: new Date().toISOString(),
});

export const mapSupabaseRowToMember = (row: any): Member => {
  const rawRole = row.role as Member['role'];
  const role: Member['role'] = VALID_MEMBER_ROLES.includes(rawRole) ? rawRole : 'Membro';

  return {
    id: String(row.id),
    name: String(row.name || ''),
    role,
    color: String(row.color || '#2563eb'),
    avatar: String(row.avatar || '👤'),
    email: row.email || undefined,
    phone: row.phone || undefined,
  };
};

export const mapBudgetToSupabaseRow = (b: CategoryBudget, mode: ProfileMode) => ({
  id: b.id,
  profile_mode: mode,
  category: b.category,
  monthly_limit: Number(b.monthlyLimit) || 0,
  color: b.color,
  icon: b.icon,
  type: b.type,
  updated_at: new Date().toISOString(),
});

export const mapSupabaseRowToBudget = (row: any): CategoryBudget => ({
  id: String(row.id),
  category: String(row.category || ''),
  monthlyLimit: Number(row.monthly_limit ?? row.monthlyLimit ?? 0),
  color: String(row.color || '#3b82f6'),
  icon: String(row.icon || 'Tag'),
  type: row.type === 'receita' ? 'receita' : 'despesa',
});

export const mapAccountToSupabaseRow = (a: PaymentAccount, mode: ProfileMode) => ({
  id: a.id,
  profile_mode: mode,
  name: a.name,
  type: a.type,
  closing_day: a.closingDay || null,
  due_day: a.dueDay || null,
  credit_limit: a.creditLimit ? Number(a.creditLimit) : null,
  color: a.color || '#2563eb',
  updated_at: new Date().toISOString(),
});

export const mapSupabaseRowToAccount = (row: any): PaymentAccount => {
  const rawType = (row.type as PaymentAccount['type']) || 'conta_corrente';
  const type = VALID_ACCOUNT_TYPES.includes(rawType) ? rawType : 'conta_corrente';

  return {
    id: String(row.id),
    name: String(row.name || ''),
    type,
    closingDay: row.closing_day ?? row.closingDay ?? undefined,
    dueDay: row.due_day ?? row.dueDay ?? undefined,
    creditLimit: row.credit_limit !== undefined && row.credit_limit !== null
      ? Number(row.credit_limit)
      : row.creditLimit !== undefined ? Number(row.creditLimit) : undefined,
    color: row.color || '#2563eb',
  };
};

// --- ASYNCHRONOUS SUPABASE PERSISTENCE FUNCTIONS ---

/**
 * Salva todas as transações (receitas e despesas) no Supabase
 */
export const saveTransactionsToSupabase = async (
  mode: ProfileMode,
  transactions: Transaction[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase não configurado (VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes).' };
  }

  try {
    const rows = transactions.map((t) => mapTransactionToSupabaseRow(t, mode));

    if (rows.length > 0) {
      const { error: upsertError } = await client
        .from('transactions')
        .upsert(rows, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // Deleta transações antigas deste perfil que foram excluídas pelo usuário
      const activeIds = transactions.map((t) => t.id);
      const { error: deleteError } = await client
        .from('transactions')
        .delete()
        .eq('profile_mode', mode)
        .not('id', 'in', `(${activeIds.map((id) => `"${id}"`).join(',')})`);

      if (deleteError) {
        console.warn('Aviso ao sincronizar exclusões de transações no Supabase:', deleteError.message);
      }
    } else {
      await client.from('transactions').delete().eq('profile_mode', mode);
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    console.error('Erro ao salvar transações no Supabase:', err);
    return { success: false, count: 0, error: err.message || String(err) };
  }
};

/**
 * Carrega todas as transações (receitas e despesas) do Supabase para o perfil atual
 */
export const fetchTransactionsFromSupabase = async (
  mode: ProfileMode
): Promise<Transaction[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('profile_mode', mode)
      .order('date', { ascending: false });

    if (error) throw error;
    if (!data || !Array.isArray(data)) return null;

    return data.map(mapSupabaseRowToTransaction);
  } catch (err: any) {
    console.error('Erro ao buscar transações do Supabase:', err);
    return null;
  }
};

/**
 * Salva todos os usuários/membros no Supabase
 */
export const saveMembersToSupabase = async (
  mode: ProfileMode,
  members: Member[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase não configurado.' };
  }

  try {
    const rows = members.map((m) => mapMemberToSupabaseRow(m, mode));

    if (rows.length > 0) {
      const { error: upsertError } = await client
        .from('members')
        .upsert(rows, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      const activeIds = members.map((m) => m.id);
      await client
        .from('members')
        .delete()
        .eq('profile_mode', mode)
        .not('id', 'in', `(${activeIds.map((id) => `"${id}"`).join(',')})`);
    } else {
      await client.from('members').delete().eq('profile_mode', mode);
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    console.error('Erro ao salvar membros no Supabase:', err);
    return { success: false, count: 0, error: err.message || String(err) };
  }
};

/**
 * Carrega todos os membros/usuários do Supabase
 */
export const fetchMembersFromSupabase = async (
  mode: ProfileMode
): Promise<Member[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('members')
      .select('*')
      .eq('profile_mode', mode);

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return data.map(mapSupabaseRowToMember);
  } catch (err: any) {
    console.error('Erro ao buscar membros do Supabase:', err);
    return null;
  }
};

/**
 * Salva categorias de orçamentos (receitas e despesas) no Supabase
 */
export const saveBudgetsToSupabase = async (
  mode: ProfileMode,
  budgets: CategoryBudget[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase não configurado.' };
  }

  try {
    const rows = budgets.map((b) => mapBudgetToSupabaseRow(b, mode));

    if (rows.length > 0) {
      const { error: upsertError } = await client
        .from('budgets')
        .upsert(rows, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      const activeIds = budgets.map((b) => b.id);
      await client
        .from('budgets')
        .delete()
        .eq('profile_mode', mode)
        .not('id', 'in', `(${activeIds.map((id) => `"${id}"`).join(',')})`);
    } else {
      await client.from('budgets').delete().eq('profile_mode', mode);
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    console.error('Erro ao salvar orçamentos no Supabase:', err);
    return { success: false, count: 0, error: err.message || String(err) };
  }
};

/**
 * Carrega orçamentos e categorias do Supabase
 */
export const fetchBudgetsFromSupabase = async (
  mode: ProfileMode
): Promise<CategoryBudget[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('budgets')
      .select('*')
      .eq('profile_mode', mode);

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return data.map(mapSupabaseRowToBudget);
  } catch (err: any) {
    console.error('Erro ao buscar orçamentos do Supabase:', err);
    return null;
  }
};

/**
 * Salva contas de pagamento no Supabase
 */
export const saveAccountsToSupabase = async (
  mode: ProfileMode,
  accounts: PaymentAccount[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase não configurado.' };
  }

  try {
    const rows = accounts.map((a) => mapAccountToSupabaseRow(a, mode));

    if (rows.length > 0) {
      const { error: upsertError } = await client
        .from('accounts')
        .upsert(rows, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      const activeIds = accounts.map((a) => a.id);
      await client
        .from('accounts')
        .delete()
        .eq('profile_mode', mode)
        .not('id', 'in', `(${activeIds.map((id) => `"${id}"`).join(',')})`);
    } else {
      await client.from('accounts').delete().eq('profile_mode', mode);
    }

    return { success: true, count: rows.length };
  } catch (err: any) {
    console.error('Erro ao salvar contas no Supabase:', err);
    return { success: false, count: 0, error: err.message || String(err) };
  }
};

/**
 * Carrega contas de pagamento do Supabase
 */
export const fetchAccountsFromSupabase = async (
  mode: ProfileMode
): Promise<PaymentAccount[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('profile_mode', mode);

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return data.map(mapSupabaseRowToAccount);
  } catch (err: any) {
    console.error('Erro ao buscar contas do Supabase:', err);
    return null;
  }
};

/**
 * Sincroniza todos os dados locais (transações, receitas, despesas, usuários e orçamentos) com o Supabase
 */
export const syncAllToSupabase = async (
  mode: ProfileMode
): Promise<{ success: boolean; message: string; details?: any }> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
    };
  }

  const txs = getTransactions(mode);
  const mems = getMembers(mode);
  const bdgs = getBudgets(mode);
  const accs = getAccounts(mode);

  const [txRes, memRes, bdgRes, accRes] = await Promise.all([
    saveTransactionsToSupabase(mode, txs),
    saveMembersToSupabase(mode, mems),
    saveBudgetsToSupabase(mode, bdgs),
    saveAccountsToSupabase(mode, accs),
  ]);

  const allSuccess = txRes.success && memRes.success && bdgRes.success && accRes.success;
  const errorMsg = [txRes.error, memRes.error, bdgRes.error, accRes.error].filter(Boolean).join('; ');

  return {
    success: allSuccess,
    message: allSuccess
      ? `Sincronização concluída com sucesso! (${txRes.count} transações/receitas/despesas, ${memRes.count} usuários, ${bdgRes.count} categorias, ${accRes.count} contas salvas no Supabase)`
      : `Houve erro na sincronização: ${errorMsg}`,
    details: { txRes, memRes, bdgRes, accRes },
  };
};

/**
 * Baixa todos os dados do Supabase e atualiza o armazenamento local
 */
export const syncAllFromSupabase = async (
  mode: ProfileMode
): Promise<{
  success: boolean;
  message: string;
  transactions?: Transaction[];
  members?: Member[];
  budgets?: CategoryBudget[];
  accounts?: PaymentAccount[];
}> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase não configurado.',
    };
  }

  const [txs, mems, bdgs, accs] = await Promise.all([
    fetchTransactionsFromSupabase(mode),
    fetchMembersFromSupabase(mode),
    fetchBudgetsFromSupabase(mode),
    fetchAccountsFromSupabase(mode),
  ]);

  if (txs) {
    const key = `${STORAGE_KEYS.TRANSACTIONS}_${mode}`;
    localStorage.setItem(key, JSON.stringify(txs));
  }
  if (mems) {
    const key = `${STORAGE_KEYS.MEMBERS}_${mode}`;
    localStorage.setItem(key, JSON.stringify(mems));
  }
  if (bdgs) {
    const key = `${STORAGE_KEYS.BUDGETS}_${mode}`;
    localStorage.setItem(key, JSON.stringify(bdgs));
  }
  if (accs) {
    const key = `${STORAGE_KEYS.ACCOUNTS}_${mode}`;
    localStorage.setItem(key, JSON.stringify(accs));
  }

  return {
    success: true,
    message: 'Dados importados do Supabase com sucesso!',
    transactions: txs || undefined,
    members: mems || undefined,
    budgets: bdgs || undefined,
    accounts: accs || undefined,
  };
};

/**
 * Testa a conexão com o Supabase e a existência das tabelas
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  tables: { transactions: boolean; members: boolean; budgets: boolean; accounts: boolean };
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.',
      tables: { transactions: false, members: false, budgets: false, accounts: false },
    };
  }

  const checkTable = async (tableName: string) => {
    try {
      const { error } = await client.from(tableName).select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const [t1, t2, t3, t4] = await Promise.all([
    checkTable('transactions'),
    checkTable('members'),
    checkTable('budgets'),
    checkTable('accounts'),
  ]);

  const allTablesOk = t1 && t2 && t3 && t4;
  return {
    success: allTablesOk,
    message: allTablesOk
      ? 'Conexão com o Supabase estabelecida com sucesso! Todas as tabelas encontradas.'
      : 'Conectado ao Supabase, mas uma ou mais tabelas ainda não foram criadas. Copie e execute o script SQL disponibilizado.',
    tables: {
      transactions: t1,
      members: t2,
      budgets: t3,
      accounts: t4,
    },
  };
};

/**
 * Gera o script SQL pronto para copiar e colar no Editor SQL do Supabase
 */
export const generateSupabaseSQLSchema = (): string => {
  return `-- ============================================================================
-- SCRIPT SQL DE CRIAÇÃO DAS TABELAS NO SUPABASE (CONTROLE FINANCEIRO)
-- Execute este script no menu "SQL Editor" do seu painel Supabase
-- ============================================================================

-- 1. TABELA DE TRANSAÇÕES (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  profile_mode TEXT NOT NULL DEFAULT 'familia',
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL, -- 'entrada' (receita), 'saida' (despesa), 'falta_pagar', 'falta_receber'
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  due_date TEXT,
  paid_date TEXT,
  member_id TEXT NOT NULL,
  account TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pago', 'pendente', 'atrasado'
  notes TEXT,
  fine_penalty_estimated NUMERIC(12, 2) DEFAULT 0,
  invoice_barcode TEXT,
  payment_mode TEXT DEFAULT 'unico', -- 'unico', 'recorrente', 'parcelado'
  installment_current INTEGER,
  installment_total INTEGER,
  installment_group_id TEXT,
  recurrence_frequency TEXT,
  is_credit_card BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE MEMBROS E USUÁRIOS
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  profile_mode TEXT NOT NULL DEFAULT 'familia',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2563eb',
  avatar TEXT NOT NULL DEFAULT '👤',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE ORÇAMENTOS E CATEGORIAS (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  profile_mode TEXT NOT NULL DEFAULT 'familia',
  category TEXT NOT NULL,
  monthly_limit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'Tag',
  type TEXT NOT NULL DEFAULT 'despesa', -- 'despesa', 'receita'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE CONTAS E MEIOS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  profile_mode TEXT NOT NULL DEFAULT 'familia',
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'conta_corrente',
  closing_day INTEGER,
  due_day INTEGER,
  credit_limit NUMERIC(12, 2),
  color TEXT NOT NULL DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a chave pública Anon
DROP POLICY IF EXISTS "Public access transactions" ON transactions;
CREATE POLICY "Public access transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access members" ON members;
CREATE POLICY "Public access members" ON members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access budgets" ON budgets;
CREATE POLICY "Public access budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access accounts" ON accounts;
CREATE POLICY "Public access accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
`;
};

// --- SYNCHRONOUS ACCESSORS COM AUTO-PERSISTÊNCIA ASSÍNCRONA ---

export const saveTransactions = (mode: ProfileMode, transactions: Transaction[]): void => {
  const key = `${STORAGE_KEYS.TRANSACTIONS}_${mode}`;
  localStorage.setItem(key, JSON.stringify(transactions));

  // Persistência em segundo plano para o Supabase se configurado
  if (isSupabaseConfigured()) {
    saveTransactionsToSupabase(mode, transactions).catch((err) => {
      console.warn('Erro em background ao sincronizar transações com Supabase:', err);
    });
  }
};

export const getMembers = (mode: ProfileMode): Member[] => {
  const key = `${STORAGE_KEYS.MEMBERS}_${mode}`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const initial = DEFAULT_MEMBERS[mode];
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_MEMBERS[mode];
  }
};

export const saveMembers = (mode: ProfileMode, members: Member[]): void => {
  const key = `${STORAGE_KEYS.MEMBERS}_${mode}`;
  localStorage.setItem(key, JSON.stringify(members));

  // Persistência em segundo plano para o Supabase se configurado
  if (isSupabaseConfigured()) {
    saveMembersToSupabase(mode, members).catch((err) => {
      console.warn('Erro em background ao sincronizar membros com Supabase:', err);
    });
  }
};

export const getBudgets = (mode: ProfileMode): CategoryBudget[] => {
  const key = `${STORAGE_KEYS.BUDGETS}_${mode}`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const initial = DEFAULT_BUDGETS[mode];
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_BUDGETS[mode];
  }
};

export const saveBudgets = (mode: ProfileMode, budgets: CategoryBudget[]): void => {
  const key = `${STORAGE_KEYS.BUDGETS}_${mode}`;
  localStorage.setItem(key, JSON.stringify(budgets));

  // Persistência em segundo plano para o Supabase se configurado
  if (isSupabaseConfigured()) {
    saveBudgetsToSupabase(mode, budgets).catch((err) => {
      console.warn('Erro em background ao sincronizar orçamentos com Supabase:', err);
    });
  }
};

export const getAccounts = (mode: ProfileMode): PaymentAccount[] => {
  const key = `${STORAGE_KEYS.ACCOUNTS}_${mode}`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const initial = DEFAULT_ACCOUNTS[mode];
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_ACCOUNTS[mode];
  }
};

export const saveAccounts = (mode: ProfileMode, accounts: PaymentAccount[]): void => {
  const key = `${STORAGE_KEYS.ACCOUNTS}_${mode}`;
  localStorage.setItem(key, JSON.stringify(accounts));

  // Persistência em segundo plano para o Supabase se configurado
  if (isSupabaseConfigured()) {
    saveAccountsToSupabase(mode, accounts).catch((err) => {
      console.warn('Erro em background ao sincronizar contas com Supabase:', err);
    });
  }
};

export const getSheetsConfig = (): GoogleSheetsConfig => {
  const saved = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
  if (!saved) return DEFAULT_SHEETS_CONFIG;
  try {
    return { ...DEFAULT_SHEETS_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    return DEFAULT_SHEETS_CONFIG;
  }
};

export const saveSheetsConfig = (config: GoogleSheetsConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
};

// Google Apps Script Code Generator
export const generateGoogleAppsScriptCode = (): string => {
  return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SINCRONIZADOR DE CONTROLE FINANCEIRO COMPARTILHADO
 * =========================================================================
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets (planilha nova ou existente).
 * 2. No menu superior, clique em "Extensões" > "Apps Script".
 * 3. Apague qualquer código existente e cole este script completo.
 * 4. Clique em "Implantar" (canto superior direito) > "Nova Implantação".
 * 5. Clique no ícone de engrenagem ao lado de "Tipo" e selecione "Aplicativo da Web".
 * 6. Configurações essenciais:
 *    - Descrição: Sincronizador Financeiro
 *    - Executar como: Eu (seu email)
 *    - Quem tem acesso: Qualquer pessoa (Permite que o app web envie dados)
 * 7. Clique em "Implantar", conceda as permissões de acesso da sua conta Google.
 * 8. Copie a "URL do Aplicativo da Web" gerada e cole no Dashboard do App!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var txSheet = getOrCreateSheet(ss, "Transacoes", [
      "ID", "Tipo", "Descricao", "Valor", "Categoria", "Data", "Vencimento", "Status", "Membro", "Conta", "Multa_Estimada", "Observacoes"
    ]);
    
    var data = txSheet.getDataRange().getValues();
    var headers = data[0];
    var transactions = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue;
      transactions.push({
        id: String(row[0]),
        type: String(row[1]),
        description: String(row[2]),
        amount: Number(row[3]) || 0,
        category: String(row[4]),
        date: String(row[5]),
        dueDate: String(row[6] || ""),
        status: String(row[7]),
        memberId: String(row[8]),
        account: String(row[9]),
        finePenaltyEstimated: Number(row[10]) || 0,
        notes: String(row[11] || "")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: transactions.length,
      timestamp: new Date().toISOString(),
      transactions: transactions
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Aba Transações
    var txSheet = getOrCreateSheet(ss, "Transacoes", [
      "ID", "Tipo", "Descricao", "Valor (R$)", "Categoria", "Data", "Data Vencimento", "Status", "Membro ID", "Conta", "Condicao_Pagamento", "Parcela", "Multa Prevista", "Observações"
    ]);
    
    if (payload.transactions && Array.isArray(payload.transactions)) {
      // Limpa dados antigos mantendo cabeçalho
      var lastRow = txSheet.getLastRow();
      if (lastRow > 1) {
        txSheet.getRange(2, 1, lastRow - 1, 14).clearContent();
      }
      
      var rows = payload.transactions.map(function(t) {
        var installmentInfo = t.installmentTotal ? (t.installmentCurrent + "/" + t.installmentTotal) : "-";
        return [
          t.id || "",
          t.type || "",
          t.description || "",
          t.amount || 0,
          t.category || "",
          t.date || "",
          t.dueDate || "",
          t.status || "",
          t.memberId || "",
          t.account || "",
          t.paymentMode || "unico",
          installmentInfo,
          t.finePenaltyEstimated || 0,
          t.notes || ""
        ];
      });
      
      if (rows.length > 0) {
        txSheet.getRange(2, 1, rows.length, 14).setValues(rows);
        txSheet.getRange(2, 4, rows.length, 1).setNumberFormat("R$ #,##0.00");
        txSheet.getRange(2, 13, rows.length, 1).setNumberFormat("R$ #,##0.00");
      }
    }
    
    // 2. Aba Resumo Financeiro Consolidado
    if (payload.summary) {
      var sumSheet = getOrCreateSheet(ss, "Resumo_Consolidado", ["Indicador", "Valor (R$)", "Data da Sincronização"]);
      var sumRows = [
        ["Total Entradas (Recebido)", payload.summary.entradasTotal || 0, new Date()],
        ["Total Saídas (Pago)", payload.summary.saidasTotal || 0, new Date()],
        ["Total Falta Pagar (A Vencer/Vencido)", payload.summary.faltaPagarTotal || 0, new Date()],
        ["Total Falta Receber", payload.summary.faltaReceberTotal || 0, new Date()],
        ["Saldo Atual em Caixa", payload.summary.saldoAtual || 0, new Date()],
        ["Saldo Previsto (Final do Mês)", payload.summary.saldoProjetado || 0, new Date()],
        ["Taxa de Poupança/Margem (%)", (payload.summary.taxaPoupanca || 0) + "%", new Date()]
      ];
      
      var lastSumRow = sumSheet.getLastRow();
      if (lastSumRow > 1) {
        sumSheet.getRange(2, 1, lastSumRow - 1, 3).clearContent();
      }
      sumSheet.getRange(2, 1, sumRows.length, 3).setValues(sumRows);
      sumSheet.getRange(2, 2, 6, 1).setNumberFormat("R$ #,##0.00");
    }

    // 3. Aba Orçamentos por Categoria
    if (payload.budgets && Array.isArray(payload.budgets)) {
      var bgSheet = getOrCreateSheet(ss, "Orcamento_Categorias", ["Categoria", "Tipo", "Limite Mensal (R$)"]);
      var bgRows = payload.budgets.map(function(b) {
        return [b.category, b.type, b.monthlyLimit];
      });
      var lastBgRow = bgSheet.getLastRow();
      if (lastBgRow > 1) {
        bgSheet.getRange(2, 1, lastBgRow - 1, 3).clearContent();
      }
      if (bgRows.length > 0) {
        bgSheet.getRange(2, 1, bgRows.length, 3).setValues(bgRows);
        bgSheet.getRange(2, 3, bgRows.length, 1).setNumberFormat("R$ #,##0.00");
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Dados sincronizados com sucesso na planilha do Google Sheets!",
      timestamp: new Date().toISOString(),
      receivedRows: payload.transactions ? payload.transactions.length : 0
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}
`;
};

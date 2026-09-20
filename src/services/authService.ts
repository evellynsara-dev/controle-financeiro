import { AuthUser, ClientLicense, LicensePlan, LicenseStatus, MemberPermission, ProfileMode } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'fin_auth_current_user_v1',
  LICENSES: 'fin_auth_licenses_v1',
  WHITELABEL: 'fin_auth_whitelabel_v1',
};

export interface WhiteLabelConfig {
  brandName: string;
  supportPhone: string;
  supportEmail: string;
  resellerName: string;
}

export const DEFAULT_WHITELABEL: WhiteLabelConfig = {
  brandName: 'Finanças Pro (Revenda Autorizada)',
  supportPhone: '+55 11 99999-8888',
  supportEmail: 'suporte@meusoftwarefinanceiro.com.br',
  resellerName: 'SaaS Financeiro Master',
};

// Initial default licenses for resale demonstration
export const INITIAL_LICENSES: ClientLicense[] = [
  {
    id: 'lic-1',
    clientName: 'Silva Empreendimentos Ltda',
    adminEmail: 'carlos@silvaempresa.com.br',
    adminName: 'Carlos Silva',
    phone: '+55 11 98765-4321',
    licenseKey: 'FIN-2026-SILV-9901',
    plan: 'pro',
    planName: 'Plano Pro Empresarial',
    price: 89.90,
    billingCycle: 'mensal',
    status: 'ativa',
    createdAt: '2026-01-15',
    expiresAt: '2027-01-15',
    maxMembers: 5,
    profileMode: 'empresa',
    notes: 'Cliente comprou pacote anual com suporte prioritário.',
  },
  {
    id: 'lic-2',
    clientName: 'Família Oliveira Residencial',
    adminEmail: 'juliana@familiaoliveira.com',
    adminName: 'Juliana Oliveira',
    phone: '+55 21 99888-7766',
    licenseKey: 'FIN-2026-OLIV-4422',
    plan: 'basico',
    planName: 'Plano Família Essencial',
    price: 39.90,
    billingCycle: 'mensal',
    status: 'ativa',
    createdAt: '2026-02-01',
    expiresAt: '2026-12-31',
    maxMembers: 4,
    profileMode: 'familia',
    notes: 'Gestão de orçamento familiar e contas conjuntas.',
  },
  {
    id: 'lic-3',
    clientName: 'Padaria & Café Central Ltda',
    adminEmail: 'contato@cafecentral.com.br',
    adminName: 'Roberto Mendes',
    phone: '+55 31 97777-6655',
    licenseKey: 'FIN-2026-CAFE-7788',
    plan: 'empresa_plus',
    planName: 'Plano Empresa Plus Multi-usuários',
    price: 149.90,
    billingCycle: 'mensal',
    status: 'ativa',
    createdAt: '2026-03-10',
    expiresAt: '2027-03-10',
    maxMembers: 10,
    profileMode: 'empresa',
    notes: 'Controle de contas a pagar de fornecedores e previsão de fluxo de caixa.',
  },
  {
    id: 'lic-4',
    clientName: 'Studio Design & Arquitetura',
    adminEmail: 'design@studioabc.com',
    adminName: 'Amanda Castro',
    phone: '+55 41 98877-1122',
    licenseKey: 'FIN-2026-STUD-1100',
    plan: 'basico',
    planName: 'Plano Básico',
    price: 39.90,
    billingCycle: 'mensal',
    status: 'pendente',
    createdAt: '2026-02-10',
    expiresAt: '2026-03-10',
    maxMembers: 2,
    profileMode: 'empresa',
    notes: 'Aguardando confirmação do pagamento da mensalidade.',
  },
];

// Pre-configured mock users for rapid testing
export const PRESET_USERS: Record<string, AuthUser> = {
  superadmin: {
    id: 'usr-super',
    email: 'revenda@superadmin.com',
    name: 'Superadmin (Revendedor)',
    role: 'superadmin',
    avatar: '👑',
  },
  adminEmpresa: {
    id: 'usr-admin-1',
    email: 'carlos@silvaempresa.com.br',
    name: 'Carlos Silva (Admin Comprador)',
    role: 'admin',
    licenseId: 'lic-1',
    licenseName: 'Silva Empreendimentos Ltda',
    avatar: '👔',
  },
  membroOperador: {
    id: 'usr-mem-1',
    email: 'mariana@silva.com',
    name: 'Mariana Silva (Operadora Lançadora)',
    role: 'membro',
    licenseId: 'lic-1',
    licenseName: 'Silva Empreendimentos Ltda',
    permission: 'lancador',
    avatar: '👩‍💼',
  },
  membroLeitura: {
    id: 'usr-mem-2',
    email: 'lucas@silva.com',
    name: 'Lucas Silva (Somente Visualização)',
    role: 'membro',
    licenseId: 'lic-1',
    licenseName: 'Silva Empreendimentos Ltda',
    permission: 'leitura',
    avatar: '👦',
  },
};

/**
 * Obtém o usuário atualmente conectado
 */
export const getCurrentAuthUser = (): AuthUser => {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!saved) {
    // Padrão inicial: Admin Comprador para que o usuário veja o app financeiro normalmente
    return PRESET_USERS.adminEmpresa;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return PRESET_USERS.adminEmpresa;
  }
};

/**
 * Define o usuário ativo
 */
export const setCurrentAuthUser = (user: AuthUser): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

/**
 * Obtém todas as licenças de clientes cadastradas para revenda
 */
export const getClientLicenses = (): ClientLicense[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.LICENSES);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(INITIAL_LICENSES));
    return INITIAL_LICENSES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_LICENSES;
  }
};

/**
 * Salva as licenças no localStorage
 */
export const saveClientLicenses = (licenses: ClientLicense[]): void => {
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
};

/**
 * Cria uma nova licença de revenda para um cliente comprador
 */
export const createClientLicense = (data: {
  clientName: string;
  adminName: string;
  adminEmail: string;
  phone?: string;
  plan: LicensePlan;
  billingCycle: 'mensal' | 'anual' | 'unico';
  price: number;
  profileMode: ProfileMode;
  maxMembers?: number;
  notes?: string;
}): ClientLicense => {
  const licenses = getClientLicenses();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPrefix = (data.clientName.replace(/[^A-Za-z]/g, '').substring(0, 4) || 'CLI').toUpperCase();
  const year = new Date().getFullYear();
  const licenseKey = `FIN-${year}-${randomPrefix}-${randomSuffix}`;

  const planNames: Record<LicensePlan, string> = {
    basico: 'Plano Básico',
    pro: 'Plano Pro Profissional',
    empresa_plus: 'Plano Empresa Plus',
    vitalicio: 'Licença Vitalícia',
  };

  const defaultMembers: Record<LicensePlan, number> = {
    basico: 3,
    pro: 6,
    empresa_plus: 15,
    vitalicio: 10,
  };

  const now = new Date();
  const expireDate = new Date();
  if (data.billingCycle === 'mensal') {
    expireDate.setMonth(expireDate.getMonth() + 1);
  } else if (data.billingCycle === 'anual') {
    expireDate.setFullYear(expireDate.getFullYear() + 1);
  } else {
    expireDate.setFullYear(expireDate.getFullYear() + 10);
  }

  const newLicense: ClientLicense = {
    id: 'lic-' + Date.now(),
    clientName: data.clientName.trim(),
    adminEmail: data.adminEmail.trim().toLowerCase(),
    adminName: data.adminName.trim(),
    phone: data.phone?.trim(),
    licenseKey,
    plan: data.plan,
    planName: planNames[data.plan] || 'Plano Pro',
    price: Number(data.price) || 0,
    billingCycle: data.billingCycle,
    status: 'ativa',
    createdAt: now.toISOString().split('T')[0],
    expiresAt: expireDate.toISOString().split('T')[0],
    maxMembers: data.maxMembers || defaultMembers[data.plan] || 5,
    profileMode: data.profileMode,
    notes: data.notes?.trim(),
  };

  licenses.unshift(newLicense);
  saveClientLicenses(licenses);
  return newLicense;
};

/**
 * Atualiza uma licença existente
 */
export const updateClientLicense = (id: string, updates: Partial<ClientLicense>): ClientLicense | null => {
  const licenses = getClientLicenses();
  const index = licenses.findIndex((l) => l.id === id);
  if (index === -1) return null;

  licenses[index] = { ...licenses[index], ...updates };
  saveClientLicenses(licenses);
  return licenses[index];
};

/**
 * Exclui uma licença de revenda
 */
export const deleteClientLicense = (id: string): boolean => {
  const licenses = getClientLicenses();
  const filtered = licenses.filter((l) => l.id !== id);
  if (filtered.length === licenses.length) return false;
  saveClientLicenses(filtered);
  return true;
};

/**
 * Valida se uma chave de licença é válida e ativa
 */
export const verifyLicenseKey = (key: string): { valid: boolean; license?: ClientLicense; error?: string } => {
  const cleanKey = key.trim().toUpperCase();
  const licenses = getClientLicenses();
  const license = licenses.find((l) => l.licenseKey.toUpperCase() === cleanKey);

  if (!license) {
    return { valid: false, error: 'Chave de licença não encontrada no sistema de revenda.' };
  }

  if (license.status === 'bloqueada') {
    return { valid: false, error: 'Esta licença foi bloqueada pelo administrador de revenda.' };
  }

  const today = new Date().toISOString().split('T')[0];
  if (license.expiresAt < today) {
    return { valid: false, error: `Esta licença expirou em ${license.expiresAt}. Solicite a renovação.` };
  }

  return { valid: true, license };
};

/**
 * Obtém a configuração White-Label do revendedor
 */
export const getWhiteLabelConfig = (): WhiteLabelConfig => {
  const saved = localStorage.getItem(STORAGE_KEYS.WHITELABEL);
  if (!saved) return DEFAULT_WHITELABEL;
  try {
    return { ...DEFAULT_WHITELABEL, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_WHITELABEL;
  }
};

/**
 * Salva a configuração White-Label
 */
export const saveWhiteLabelConfig = (cfg: WhiteLabelConfig): void => {
  localStorage.setItem(STORAGE_KEYS.WHITELABEL, JSON.stringify(cfg));
};

/**
 * Métricas de faturamento e clientes para o Superadmin (Painel de Revenda)
 */
export const calculateResellerMetrics = () => {
  const licenses = getClientLicenses();
  const totalClients = licenses.length;
  const activeClients = licenses.filter((l) => l.status === 'ativa').length;
  const pendingClients = licenses.filter((l) => l.status === 'pendente').length;
  const blockedClients = licenses.filter((l) => l.status === 'bloqueada').length;

  const totalMonthlyRevenue = licenses
    .filter((l) => l.status === 'ativa')
    .reduce((sum, l) => {
      if (l.billingCycle === 'mensal') return sum + l.price;
      if (l.billingCycle === 'anual') return sum + (l.price / 12);
      return sum;
    }, 0);

  const totalAnnualContractValue = licenses
    .filter((l) => l.status === 'ativa')
    .reduce((sum, l) => {
      if (l.billingCycle === 'anual') return sum + l.price;
      if (l.billingCycle === 'mensal') return sum + (l.price * 12);
      return sum + l.price;
    }, 0);

  return {
    totalClients,
    activeClients,
    pendingClients,
    blockedClients,
    totalMonthlyRevenue,
    totalAnnualContractValue,
  };
};

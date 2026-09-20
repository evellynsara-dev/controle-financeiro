import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Plus,
  Users,
  Building2,
  Home,
  Copy,
  Check,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  MessageSquare,
  Key,
  Calendar,
  Sparkles,
  Settings,
} from 'lucide-react';
import { ClientLicense, LicensePlan, LicenseStatus, ProfileMode, AuthUser } from '../types';
import {
  getClientLicenses,
  createClientLicense,
  updateClientLicense,
  deleteClientLicense,
  calculateResellerMetrics,
  getWhiteLabelConfig,
  saveWhiteLabelConfig,
  WhiteLabelConfig,
} from '../services/authService';
import { formatBRL } from '../services/exportService';

interface SuperadminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImpersonateClient: (license: ClientLicense) => void;
}

export const SuperadminModal: React.FC<SuperadminModalProps> = ({
  isOpen,
  onClose,
  onImpersonateClient,
}) => {
  const [licenses, setLicenses] = useState<ClientLicense[]>(() => getClientLicenses());
  const [activeTab, setActiveTab] = useState<'licenses' | 'whitelabel'>('licenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // White label state
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(() => getWhiteLabelConfig());
  const [wlSaved, setWlSaved] = useState(false);

  // New/Edit License Modal form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<ClientLicense | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    plan: 'pro' as LicensePlan,
    billingCycle: 'mensal' as 'mensal' | 'anual' | 'unico',
    price: 89.90,
    profileMode: 'empresa' as ProfileMode,
    maxMembers: 5,
    notes: '',
  });

  if (!isOpen) return null;

  const metrics = calculateResellerMetrics();

  const refreshList = () => {
    setLicenses(getClientLicenses());
  };

  const filteredLicenses = licenses.filter((l) => {
    const matchSearch =
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.licenseKey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyWhatsAppDelivery = (l: ClientLicense) => {
    const msg = `🎉 *Olá, ${l.adminName}!* Seu acesso ao *${whiteLabel.brandName}* está pronto!\n\n` +
      `🏢 *Organização:* ${l.clientName}\n` +
      `🔑 *Sua Chave de Ativação:* \`${l.licenseKey}\`\n` +
      `📦 *Plano:* ${l.planName}\n` +
      `📅 *Validade:* até ${l.expiresAt}\n` +
      `👥 *Limite de Membros:* até ${l.maxMembers} usuários\n\n` +
      `Acesse a plataforma, clique em "Chave de Acesso" e cole sua chave para começar a utilizar imediatamente!\n` +
      `Em caso de dúvidas, suporte com ${whiteLabel.resellerName} no WhatsApp: ${whiteLabel.supportPhone}`;

    navigator.clipboard.writeText(msg);
    setCopiedKey('wa-' + l.id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleToggleStatus = (l: ClientLicense) => {
    const newStatus: LicenseStatus = l.status === 'ativa' ? 'bloqueada' : 'ativa';
    updateClientLicense(l.id, { status: newStatus });
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta licença de revenda?')) {
      deleteClientLicense(id);
      refreshList();
    }
  };

  const handleOpenNewForm = () => {
    setEditingLicense(null);
    setFormData({
      clientName: '',
      adminName: '',
      adminEmail: '',
      phone: '',
      plan: 'pro',
      billingCycle: 'mensal',
      price: 89.90,
      profileMode: 'empresa',
      maxMembers: 5,
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (l: ClientLicense) => {
    setEditingLicense(l);
    setFormData({
      clientName: l.clientName,
      adminName: l.adminName,
      adminEmail: l.adminEmail,
      phone: l.phone || '',
      plan: l.plan,
      billingCycle: l.billingCycle,
      price: l.price,
      profileMode: l.profileMode,
      maxMembers: l.maxMembers,
      notes: l.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.adminEmail.trim()) {
      alert('Preencha o nome do cliente e o e-mail do administrador.');
      return;
    }

    if (editingLicense) {
      updateClientLicense(editingLicense.id, {
        clientName: formData.clientName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        phone: formData.phone,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        price: Number(formData.price),
        profileMode: formData.profileMode,
        maxMembers: Number(formData.maxMembers),
        notes: formData.notes,
      });
    } else {
      createClientLicense({
        clientName: formData.clientName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        phone: formData.phone,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        price: Number(formData.price),
        profileMode: formData.profileMode,
        maxMembers: Number(formData.maxMembers),
        notes: formData.notes,
      });
    }

    setIsFormOpen(false);
    refreshList();
  };

  const handleSaveWhiteLabel = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhiteLabelConfig(whiteLabel);
    setWlSaved(true);
    setTimeout(() => setWlSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Painel de Superadmin • Revenda de Licenças
                </h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Dono do SaaS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gerencie clientes, planos, chaves de ativação e faturamento da sua revenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reseller KPI Metric Cards */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Receita Mensal (MRR)</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-600">
                {formatBRL(metrics.totalMonthlyRevenue)}
              </div>
              <span className="text-[10px] text-slate-400">Recorrência mensal ativa</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Clientes Ativos</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-800">
                {metrics.activeClients} <span className="text-xs font-normal text-slate-400">de {metrics.totalClients}</span>
              </div>
              <span className="text-[10px] text-slate-400">Compradores com licença ativa</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Contratos / Ano</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-800">
                {formatBRL(metrics.totalAnnualContractValue)}
              </div>
              <span className="text-[10px] text-slate-400">Valor total contratado</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Pendentes / Bloqueados</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-600">
                {metrics.pendingClients + metrics.blockedClients}
              </div>
              <span className="text-[10px] text-slate-400">Aguardando renovação</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('licenses')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'licenses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes & Licenças Vendidas ({licenses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whitelabel')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'whitelabel'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuração White-Label & Marca</span>
            </button>
          </div>

          {activeTab === 'licenses' && (
            <button
              id="btn-new-license"
              type="button"
              onClick={handleOpenNewForm}
              className="mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova Licença (Vender)</span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, e-mail ou chave de ativação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="ativa">Ativas</option>
                    <option value="pendente">Pendentes</option>
                    <option value="bloqueada">Bloqueadas</option>
                  </select>
                </div>
              </div>

              {/* Licenses Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-3.5">Cliente / Comprador</th>
                        <th className="py-3 px-3">Plano & Valor</th>
                        <th className="py-3 px-3">Chave de Ativação</th>
                        <th className="py-3 px-3">Validade</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Ações de Revenda</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLicenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Nenhum cliente ou licença encontrada com os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        filteredLicenses.map((l) => {
                          const isKeyCopied = copiedKey === l.licenseKey;
                          const isWaCopied = copiedKey === 'wa-' + l.id;

                          return (
                            <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                              {/* Cliente info */}
                              <td className="py-3 px-3.5">
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  {l.profileMode === 'empresa' ? (
                                    <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  ) : (
                                    <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  )}
                                  <span>{l.clientName}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {l.adminName} • <span className="text-slate-700">{l.adminEmail}</span>
                                </div>
                                {l.phone && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    WhatsApp: {l.phone}
                                  </div>
                                )}
                              </td>

                              {/* Plano & Preço */}
                              <td className="py-3 px-3">
                                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[11px]">
                                  {l.planName}
                                </span>
                                <div className="font-bold text-slate-900 mt-1">
                                  {formatBRL(l.price)}
                                  <span className="text-[10px] font-normal text-slate-500">
                                    /{l.billingCycle === 'mensal' ? 'mês' : l.billingCycle === 'anual' ? 'ano' : 'único'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Até {l.maxMembers} membros
                                </div>
                              </td>

                              {/* Chave de Ativação */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <code className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-[11px] text-slate-800 select-all">
                                    {l.licenseKey}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyKey(l.licenseKey)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                                    title="Copiar Chave"
                                  >
                                    {isKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyWhatsAppDelivery(l)}
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                                  title="Copiar mensagem completa de boas-vindas com chave para o WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{isWaCopied ? 'Mensagem Copiada!' : 'Copiar p/ WhatsApp'}</span>
                                </button>
                              </td>

                              {/* Validade */}
                              <td className="py-3 px-3">
                                <div className="text-slate-800 font-medium">
                                  {l.expiresAt}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Criado em {l.createdAt}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                    l.status === 'ativa'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : l.status === 'pendente'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {l.status === 'ativa' ? 'Ativa' : l.status === 'pendente' ? 'Pendente' : 'Bloqueada'}
                                </span>
                              </td>

                              {/* Ações */}
                              <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                                {/* Entrar como este Cliente (Impersonate) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    onImpersonateClient(l);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded-md font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                  title="Acessar painel financeiro exatamente como este cliente"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Acessar</span>
                                </button>

                                {/* Bloquear / Desbloquear */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(l)}
                                  className={`p-1 rounded text-slate-500 hover:bg-slate-200 transition-colors ${
                                    l.status === 'bloqueada' ? 'text-red-600' : 'text-slate-600'
                                  }`}
                                  title={l.status === 'bloqueada' ? 'Desbloquear Licença' : 'Bloquear Licença'}
                                >
                                  {l.status === 'bloqueada' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>

                                {/* Editar */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(l)}
                                  className="p-1 rounded text-slate-500 hover:bg-slate-200 transition-colors"
                                  title="Editar Licença"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Excluir */}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(l.id)}
                                  className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors"
                                  title="Excluir Licença"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURAÇÃO WHITE-LABEL */}
          {activeTab === 'whitelabel' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs text-blue-900 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Personalização de Marca do Revendedor (White-Label)</span>
                </div>
                Os dados configurados abaixo aparecerão nos rodapés, mensagens de entrega no WhatsApp e nos painéis de licença dos seus clientes compradores.
              </div>

              <form onSubmit={handleSaveWhiteLabel} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome da Sua Marca / Produto
                  </label>
                  <input
                    type="text"
                    value={whiteLabel.brandName}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Ex: GestorFinanceiro Pro"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome da Empresa Revendedora
                  </label>
                  <input
                    type="text"
                    value={whiteLabel.resellerName}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, resellerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Ex: Minha Empresa de Softwares"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      WhatsApp / Telefone de Suporte
                    </label>
                    <input
                      type="text"
                      value={whiteLabel.supportPhone}
                      onChange={(e) => setWhiteLabel({ ...whiteLabel, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      placeholder="+55 11 99999-8888"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      E-mail de Suporte
                    </label>
                    <input
                      type="email"
                      value={whiteLabel.supportEmail}
                      onChange={(e) => setWhiteLabel({ ...whiteLabel, supportEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      placeholder="suporte@suaempresa.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Salvar Configurações de Marca
                  </button>
                  {wlSaved && (
                    <span className="ml-3 text-emerald-600 font-bold inline-flex items-center gap-1">
                      <Check className="w-4 h-4" /> Salvo com sucesso!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="text-[11px] text-slate-500">
            Painel Superadmin • Módulo de Licenciamento & Revenda Integrado
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Sub-modal: New or Edit License Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 z-60 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-sm font-bold text-slate-900">
                {editingLicense ? 'Editar Licença de Cliente' : 'Emitir Nova Licença de Revenda'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Cliente / Empresa / Família *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: Silva Comércio & Varejo Ltda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Comprador / Admin *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    E-mail do Admin *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="carlos@empresa.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+55 11 98765-4321"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Perfil Principal
                  </label>
                  <select
                    value={formData.profileMode}
                    onChange={(e) => setFormData({ ...formData, profileMode: e.target.value as ProfileMode })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="empresa">Pequena Empresa (PJ)</option>
                    <option value="familia">Gestão Familiar (PF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Plano Vendido
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as LicensePlan })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="basico">Básico</option>
                    <option value="pro">Pro Profissional</option>
                    <option value="empresa_plus">Empresa Plus</option>
                    <option value="vitalicio">Vitalício</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cobrança
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Pagamento Único</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Limite de Membros/Usuários
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Observações Internas
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Pago via PIX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingLicense ? 'Salvar Alterações' : 'Criar Licença & Gerar Chave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

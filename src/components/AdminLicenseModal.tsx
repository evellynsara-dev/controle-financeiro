import React, { useState } from 'react';
import {
  X,
  Building2,
  Home,
  Users,
  Shield,
  Key,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Eye,
  PenTool,
  Phone,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { Member, ProfileMode, ClientLicense, AuthUser, MemberPermission } from '../types';
import { getWhiteLabelConfig, getClientLicenses } from '../services/authService';

interface AdminLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  profileMode: ProfileMode;
  members: Member[];
  onSaveMembers: (members: Member[]) => void;
  onSwitchToMember: (member: Member) => void;
}

const AVATAR_OPTIONS = ['👨‍💼', '👩‍💼', '👦', '👧', '👴', '👵', '👔', '💼', '💻', '🧑‍🔧', '🚀', '⭐'];
const COLOR_OPTIONS = ['#2563eb', '#db2777', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#475569'];

export const AdminLicenseModal: React.FC<AdminLicenseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profileMode,
  members,
  onSaveMembers,
  onSwitchToMember,
}) => {
  const [activeTab, setActiveTab] = useState<'license' | 'members' | 'invite'>('license');
  const [copied, setCopied] = useState<string | null>(null);

  // New member form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Member['role']>(profileMode === 'familia' ? 'Familiar' : 'Membro');
  const [permission, setPermission] = useState<MemberPermission>('lancador');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const whiteLabel = getWhiteLabelConfig();
  const licenses = getClientLicenses();
  const currentLicense: ClientLicense | undefined = currentUser.licenseId
    ? licenses.find((l) => l.id === currentUser.licenseId)
    : licenses[0];

  const maxMembers = currentLicense?.maxMembers || 5;
  const isMemberLimitReached = members.length >= maxMembers;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isMemberLimitReached) {
      alert(`O limite de membros (${maxMembers}) do seu plano atual foi atingido. Entre em contato com o suporte para expandir.`);
      return;
    }

    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      role,
      permission,
      avatar,
      color,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    onSaveMembers([...members, newMember]);
    setName('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      alert('É necessário manter pelo menos um membro responsável.');
      return;
    }
    if (confirm('Tem certeza de que deseja remover este membro da organização?')) {
      onSaveMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleUpdatePermission = (memberId: string, newPerm: MemberPermission) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, permission: newPerm };
      }
      return m;
    });
    onSaveMembers(updated);
  };

  const inviteMessage = `👋 Olá! Você foi convidado para acessar o controle financeiro de *${currentLicense?.clientName || 'Nossa Organização'}* no *${whiteLabel.brandName}*.\n\n` +
    `🔑 *Chave de Acesso:* \`${currentLicense?.licenseKey || 'CONSULTE-SEU-ADMIN'}\`\n` +
    `Para começar, acesse a plataforma, clique em "Trocar Usuário / Chave" e selecione seu perfil ou cole a chave de acesso.`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
              {profileMode === 'empresa' ? <Building2 className="w-6 h-6" /> : <Home className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Painel do Administrador • {currentLicense?.clientName || 'Minha Organização'}
                </h3>
                <span className="px-2 py-0.5 bg-blue-400/30 border border-blue-300/40 text-blue-100 font-bold text-[10px] rounded-full uppercase">
                  Cliente Comprador
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Gerencie sua licença contratada, limite de membros e permissões de acesso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('license')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'license'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Minha Licença & Suporte</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'members'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Membros & Permissões ({members.length}/{maxMembers})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invite')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'invite'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Convidar Membros</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs">
          {/* TAB 1: MINHA LICENÇA */}
          {activeTab === 'license' && (
            <div className="space-y-4">
              {/* License Status Card */}
              <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/60">
                  <div>
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                      Plano Ativo
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {currentLicense?.planName || 'Plano Pro'}
                    </div>
                    <div className="text-slate-600 text-xs mt-0.5">
                      Organização: <span className="font-semibold text-slate-900">{currentLicense?.clientName}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Licença Ativa
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Válida até {currentLicense?.expiresAt || '2027-01-15'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Chave de Ativação</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 border border-slate-200 rounded">
                        {currentLicense?.licenseKey || 'FIN-2026-X9A7'}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentLicense?.licenseKey || '', 'key')}
                        className="p-1 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                        title="Copiar Chave"
                      >
                        {copied === 'key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Capacidade de Usuários</div>
                    <div className="font-bold text-slate-900 text-sm mt-1">
                      {members.length} de {maxMembers} membros ativos
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min((members.length / maxMembers) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px] font-medium">Administrador Titular</div>
                    <div className="font-bold text-slate-900 text-sm mt-1">
                      {currentLicense?.adminName || currentUser.name}
                    </div>
                    <div className="text-slate-500 text-[11px]">{currentLicense?.adminEmail || currentUser.email}</div>
                  </div>
                </div>
              </div>

              {/* Support & Reseller Info Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Suporte do Revendedor Autorizado</h4>
                      <p className="text-[11px] text-slate-500">
                        {whiteLabel.resellerName} • {whiteLabel.brandName}
                      </p>
                    </div>
                  </div>

                  {whiteLabel.supportPhone && (
                    <a
                      href={`https://wa.me/${whiteLabel.supportPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Falar no WhatsApp</span>
                    </a>
                  )}
                </div>
                <div className="mt-3 text-[11px] text-slate-600">
                  Para renovações, upgrade de membros ou dúvidas técnicas, entre em contato diretamente com seu revendedor pelo WhatsApp <span className="font-semibold">{whiteLabel.supportPhone}</span> ou e-mail <span className="font-semibold">{whiteLabel.supportEmail}</span>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTÃO DE MEMBROS E PERMISSÕES */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Membros Cadastrados</h4>
                  <p className="text-[11px] text-slate-500">
                    Defina o papel e nível de permissão de cada pessoa da família ou empresa
                  </p>
                </div>

                {!showAddForm && (
                  <button
                    type="button"
                    disabled={isMemberLimitReached}
                    onClick={() => setShowAddForm(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-2xs ${
                      isMemberLimitReached
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Membro</span>
                  </button>
                )}
              </div>

              {isMemberLimitReached && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Você atingiu o limite de {maxMembers} membros da sua licença. Fale com seu revendedor para expandir o plano.</span>
                </div>
              )}

              {/* Add Member Form */}
              {showAddForm && (
                <form onSubmit={handleAddMember} className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs">Adicionar Novo Membro</h5>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nome do Membro *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Mariana Silva"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nível de Permissão
                      </label>
                      <select
                        value={permission}
                        onChange={(e) => setPermission(e.target.value as MemberPermission)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                      >
                        <option value="lancador">✍️ Lançador (Lança receitas/despesas e paga)</option>
                        <option value="leitura">👁️ Somente Leitura (Consulta saldos e relatórios)</option>
                        <option value="total">🛡️ Administrador (Acesso completo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mariana@empresa.com"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+55 11 98888-7777"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                    >
                      Salvar Membro
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {members.map((m) => {
                  const perm = m.permission || 'lancador';

                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
                          style={{ backgroundColor: `${m.color}20`, border: `1.5px solid ${m.color}` }}
                        >
                          {m.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-normal">
                              {m.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            {m.email && <span>{m.email}</span>}
                            {m.phone && <span>• {m.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Selector de Permissão */}
                        <select
                          value={perm}
                          onChange={(e) => handleUpdatePermission(m.id, e.target.value as MemberPermission)}
                          className="py-1 px-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold focus:outline-hidden"
                          title="Alterar permissão deste membro"
                        >
                          <option value="total">🛡️ Acesso Total</option>
                          <option value="lancador">✍️ Lançador</option>
                          <option value="leitura">👁️ Somente Leitura</option>
                        </select>

                        {/* Botão de testar na visão deste membro */}
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchToMember(m);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors"
                          title="Alternar para a visão deste membro para testar o sistema"
                        >
                          Testar Visão
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remover Membro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CONVIDAR MEMBROS */}
          {activeTab === 'invite' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Convite Rápido via WhatsApp</span>
                </div>
                Copie a mensagem abaixo e envie para os membros da sua família ou equipe para que eles possam utilizar o sistema de imediato:
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs whitespace-pre-wrap select-all leading-relaxed relative">
                {inviteMessage}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopy(inviteMessage, 'invite')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
                >
                  {copied === 'invite' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'invite' ? 'Mensagem Copiada!' : 'Copiar Convite para WhatsApp'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="text-[11px] text-slate-500">
            Painel do Administrador Comprador • Licença {currentLicense?.planName || 'Pro'}
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
    </div>
  );
};

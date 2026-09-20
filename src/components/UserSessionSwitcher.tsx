import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Key,
  LogOut,
  ChevronDown,
  Check,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { AuthUser, ClientLicense } from '../types';
import {
  PRESET_USERS,
  verifyLicenseKey,
  getClientLicenses,
  setCurrentAuthUser,
} from '../services/authService';

interface UserSessionSwitcherProps {
  currentUser: AuthUser;
  onUserChange: (newUser: AuthUser) => void;
  onOpenSuperadminModal: () => void;
  onOpenAdminLicenseModal: () => void;
}

export const UserSessionSwitcher: React.FC<UserSessionSwitcherProps> = ({
  currentUser,
  onUserChange,
  onOpenSuperadminModal,
  onOpenAdminLicenseModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);

  const handleSelectPreset = (user: AuthUser) => {
    setCurrentAuthUser(user);
    onUserChange(user);
    setIsOpen(false);
  };

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError(null);
    setLicenseSuccess(null);

    const res = verifyLicenseKey(licenseInput);
    if (!res.valid || !res.license) {
      setLicenseError(res.error || 'Chave de licença inválida.');
      return;
    }

    const license = res.license;
    const activatedUser: AuthUser = {
      id: `usr-admin-${license.id}`,
      email: license.adminEmail,
      name: `${license.adminName} (Admin)`,
      role: 'admin',
      licenseId: license.id,
      licenseName: license.clientName,
      avatar: '👔',
    };

    setCurrentAuthUser(activatedUser);
    onUserChange(activatedUser);
    setLicenseSuccess(`Licença "${license.clientName}" ativada com sucesso!`);
    setTimeout(() => {
      setIsOpen(false);
      setLicenseSuccess(null);
      setLicenseInput('');
    }, 1500);
  };

  const getRoleBadge = () => {
    if (currentUser.role === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
          👑 Superadmin (Revenda)
        </span>
      );
    }
    if (currentUser.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          🏢 Admin (Comprador)
        </span>
      );
    }
    if (currentUser.permission === 'leitura') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          👁️ Somente Leitura
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        ✍️ Lançador
      </span>
    );
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        id="btn-user-session"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs shadow-2xs"
        title="Alternar entre Superadmin, Admin Comprador e Membros"
      >
        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
          {currentUser.avatar || '👤'}
        </div>
        <div className="text-left hidden md:block">
          <div className="font-bold text-slate-800 leading-tight max-w-[140px] truncate">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-slate-500 leading-none mt-0.5">
            {getRoleBadge()}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
      </button>

      {/* Session Modal / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">Controle de Acessos & Papéis</div>
              <div className="text-[11px] text-slate-500">Superadmin, Admin Comprador e Membros</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Quick Action to open dedicated management modals */}
          <div className="space-y-2 mb-4">
            {currentUser.role === 'superadmin' ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSuperadminModal();
                }}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold flex items-center justify-between shadow-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Abrir Painel de Revenda (Superadmin)</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Gerenciar</span>
              </button>
            ) : currentUser.role === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdminLicenseModal();
                }}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center justify-between shadow-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Painel do Admin (Licença & Membros)</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Gerenciar</span>
              </button>
            ) : null}
          </div>

          {/* Preset Roles Switcher (Para Testes e Demonstração Instantânea) */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Alternar Perfil para Testar
            </div>
            <div className="space-y-1.5">
              {/* 1. Superadmin */}
              <button
                type="button"
                onClick={() => handleSelectPreset(PRESET_USERS.superadmin)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all text-left ${
                  currentUser.role === 'superadmin'
                    ? 'border-amber-400 bg-amber-50/70 text-amber-950 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-xs">Superadmin (Revendedor)</div>
                    <div className="text-[10px] text-slate-500">Cria licenças, define planos, gerencia revenda</div>
                  </div>
                </div>
                {currentUser.role === 'superadmin' && <Check className="w-4 h-4 text-amber-600" />}
              </button>

              {/* 2. Admin Comprador */}
              <button
                type="button"
                onClick={() => handleSelectPreset(PRESET_USERS.adminEmpresa)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all text-left ${
                  currentUser.role === 'admin'
                    ? 'border-blue-400 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👔</span>
                  <div>
                    <div className="font-bold text-xs">Admin Comprador (Cliente)</div>
                    <div className="text-[10px] text-slate-500">Dono da empresa/família, gerencia membros</div>
                  </div>
                </div>
                {currentUser.role === 'admin' && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* 3. Membro Lançador */}
              <button
                type="button"
                onClick={() => handleSelectPreset(PRESET_USERS.membroOperador)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all text-left ${
                  currentUser.role === 'membro' && currentUser.permission === 'lancador'
                    ? 'border-emerald-400 bg-emerald-50/70 text-emerald-950 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👩‍💼</span>
                  <div>
                    <div className="font-bold text-xs">Membro Família/Empresa (Lançador)</div>
                    <div className="text-[10px] text-slate-500">Registra receitas, despesas e quita contas</div>
                  </div>
                </div>
                {currentUser.role === 'membro' && currentUser.permission === 'lancador' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>

              {/* 4. Membro Somente Leitura */}
              <button
                type="button"
                onClick={() => handleSelectPreset(PRESET_USERS.membroLeitura)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all text-left ${
                  currentUser.role === 'membro' && currentUser.permission === 'leitura'
                    ? 'border-slate-400 bg-slate-100 text-slate-950 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👦</span>
                  <div>
                    <div className="font-bold text-xs">Membro Somente Leitura</div>
                    <div className="text-[10px] text-slate-500">Apenas consulta relatórios e saldos</div>
                  </div>
                </div>
                {currentUser.role === 'membro' && currentUser.permission === 'leitura' && (
                  <Check className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Entrar com Chave de Licença */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Ativar com Chave de Licença de Compra</span>
            </div>
            <form onSubmit={handleActivateLicense} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="Ex: FIN-2026-SILV-9901"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs shrink-0 shadow-2xs"
                >
                  Ativar
                </button>
              </div>

              {licenseError && (
                <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{licenseError}</span>
                </div>
              )}

              {licenseSuccess && (
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{licenseSuccess}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

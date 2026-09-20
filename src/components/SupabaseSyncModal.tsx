import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Code,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ProfileMode } from '../types';
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  testSupabaseConnection,
  syncAllToSupabase,
  syncAllFromSupabase,
  generateSupabaseSQLSchema,
} from '../services/storage';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileMode: ProfileMode;
  onDataReloaded?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  profileMode,
  onDataReloaded,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'instructions'>('status');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingUp, setIsSyncingUp] = useState(false);
  const [isSyncingDown, setIsSyncingDown] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    tables?: { transactions: boolean; members: boolean; budgets: boolean; accounts: boolean };
  } | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const isConfigured = isSupabaseConfigured();
  const sqlSchema = generateSupabaseSQLSchema();

  useEffect(() => {
    if (isOpen && isConfigured && !testResult) {
      handleTestConnection();
    }
  }, [isOpen, isConfigured]);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
        tables: res.tables,
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Conexão e tabelas validadas no Supabase!' });
      } else {
        setFeedback({ type: 'info', message: res.message });
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err?.message || 'Falha ao testar conexão.',
      });
      setFeedback({ type: 'error', message: 'Falha ao conectar com o Supabase.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUploadAll = async () => {
    setIsSyncingUp(true);
    setFeedback(null);
    try {
      const res = await syncAllToSupabase(profileMode);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        handleTestConnection();
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro durante a sincronização.' });
    } finally {
      setIsSyncingUp(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsSyncingDown(true);
    setFeedback(null);
    try {
      const res = await syncAllFromSupabase(profileMode);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        if (onDataReloaded) onDataReloaded();
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao carregar dados do Supabase.' });
    } finally {
      setIsSyncingDown(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                Conexão com Supabase
                {isConfigured ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Configurado
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Aguardando Chaves
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Sincronize transações, receitas, despesas e usuários em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Status & Sincronização
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Script SQL das Tabelas
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Como Configurar
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Environment info card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Variáveis de Ambiente Detectadas:</span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-medium ${
                      isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isConfigured ? 'VITE_SUPABASE_URL e KEY Ativas' : 'Não Detectadas'}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 overflow-x-auto">
                  <div>
                    <span className="text-slate-400">VITE_SUPABASE_URL:</span>{' '}
                    {SUPABASE_URL || '<vazio ou não definido no .env>'}
                  </div>
                  <div>
                    <span className="text-slate-400">VITE_SUPABASE_ANON_KEY:</span>{' '}
                    {isConfigured ? '••••••••••••••••••••••••' : '<vazio>'}
                  </div>
                </div>
              </div>

              {/* Automatic sync notice */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Salvamento Automático Ativo</p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Com as chaves configuradas, todas as criações, edições e exclusões de transações, receitas, despesas e membros são salvas automaticamente no Supabase em segundo plano.
                  </p>
                </div>
              </div>

              {/* Table verification grid */}
              {testResult?.tables && (
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2 text-xs">
                  <span className="font-semibold text-slate-700 block">Status das Tabelas no Supabase:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">Transações</span>
                      {testResult.tables.transactions ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">Usuários</span>
                      {testResult.tables.members ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">Categorias</span>
                      {testResult.tables.budgets ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">Contas</span>
                      {testResult.tables.accounts ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </button>

                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={isSyncingUp || !isConfigured}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncingUp ? 'animate-bounce' : ''}`} />
                  {isSyncingUp ? 'Enviando...' : 'Exportar p/ Supabase'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={isSyncingDown || !isConfigured}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 ${isSyncingDown ? 'animate-bounce' : ''}`} />
                  {isSyncingDown ? 'Importando...' : 'Importar do Supabase'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Execute este script no <strong>SQL Editor</strong> do painel Supabase para criar as tabelas e permissões:
                </span>
                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl max-h-[340px] overflow-y-auto whitespace-pre-wrap border border-slate-800 leading-relaxed">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Passo a Passo de Configuração</h3>
                <ol className="list-decimal pl-4 space-y-2 text-slate-600">
                  <li>
                    Crie ou acesse seu projeto no{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 underline font-medium inline-flex items-center gap-0.5"
                    >
                      Supabase <ExternalLink className="w-3 h-3 inline" />
                    </a>.
                  </li>
                  <li>
                    Acesse <strong>Project Settings</strong> &gt; <strong>API</strong> e copie a <strong>Project URL</strong> e a chave <strong>anon public</strong>.
                  </li>
                  <li>
                    Adicione essas chaves nas variáveis de ambiente do projeto:
                    <div className="bg-white p-2.5 mt-1 rounded border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                      <div>VITE_SUPABASE_URL="https://seu-projeto.supabase.co"</div>
                      <div>VITE_SUPABASE_ANON_KEY="sua-chave-anon"</div>
                    </div>
                  </li>
                  <li>
                    Vá na aba <strong>Script SQL das Tabelas</strong> desta janela, copie o código e cole no <strong>SQL Editor</strong> do seu Supabase para criar as tabelas de transações, membros, orçamentos e contas.
                  </li>
                  <li>
                    Pronto! Todas as receitas, despesas e membros passarão a ser salvos e sincronizados automaticamente na nuvem do Supabase!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            Perfil ativo:{' '}
            <strong className="text-slate-800 capitalize">{profileMode}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Download,
  Database,
} from 'lucide-react';
import { GoogleSheetsConfig, Transaction, FinancialSummary, CategoryBudget, Member } from '../types';
import { generateGoogleAppsScriptCode } from '../services/storage';
import { exportToGoogleSheetsBackup } from '../services/exportService';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  transactions: Transaction[];
  summary: FinancialSummary;
  budgets: CategoryBudget[];
  members?: Member[];
  periodName?: string;
  onSyncWithSheets: (scriptUrl: string) => Promise<{ success: boolean; message: string }>;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  transactions,
  summary,
  budgets,
  members = [],
  periodName = 'Geral',
  onSyncWithSheets,
}) => {
  const [scriptUrl, setScriptUrl] = useState(config.scriptUrl || '');
  const [sheetId, setSheetId] = useState(config.sheetId || 'Controle_Financeiro_Compartilhado_2026');
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'tutorial' | 'backup'>('config');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const appsScriptCode = generateGoogleAppsScriptCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadBackup = () => {
    exportToGoogleSheetsBackup(transactions, summary, budgets, members, periodName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleSaveAndSync = async () => {
    const updatedConfig: GoogleSheetsConfig = {
      ...config,
      scriptUrl: scriptUrl.trim(),
      sheetId: sheetId.trim(),
      autoSync,
    };
    onSaveConfig(updatedConfig);

    if (!scriptUrl.trim()) {
      setSyncFeedback({
        success: false,
        message: 'Por favor, informe a URL do Aplicativo da Web do Google Apps Script.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await onSyncWithSheets(scriptUrl.trim());
      setSyncFeedback(res);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Falha ao sincronizar com Google Sheets.';
      setSyncFeedback({
        success: false,
        message: errMsg,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sincronização com Google Sheets & Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Mantenha todas as informações salvas e sincronizadas automaticamente em sua planilha
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Configuração & Conexão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Código do Google Apps Script</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Backup Planilha (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tutorial')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Guia Rápido (3 Passos)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  config.syncStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : config.scriptUrl
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {config.syncStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {config.syncStatus === 'success'
                      ? 'Planilha Google Sheets Sincronizada!'
                      : config.scriptUrl
                      ? 'URL de Sincronização Configurada'
                      : 'Modo Local Ativo'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {config.lastSyncAt
                      ? `Última sincronização bem-sucedida em: ${new Date(config.lastSyncAt).toLocaleString('pt-BR')}`
                      : 'Cole a URL do Aplicativo da Web do Google Apps Script abaixo para sincronizar em tempo real.'}
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  URL do Aplicativo da Web do Google Apps Script *
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Obtida ao implantar o script no Google Sheets (menu <em>Implantar &gt; Nova Implantação &gt; Aplicativo da Web</em>).
                </p>
              </div>

              {/* Sheet Identifier */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nome ou Identificador da Planilha
                </label>
                <input
                  type="text"
                  placeholder="Controle_Financeiro_Compartilhado_2026"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Auto Sync Checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Sincronização Automática</div>
                  <div className="text-[11px] text-slate-500">
                    Sincronizar com o Google Sheets sempre que adicionar ou alterar um gasto
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              {/* Feedback Alert */}
              {syncFeedback && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 ${
                    syncFeedback.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {syncFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium">{syncFeedback.message}</span>
                </div>
              )}

              {/* Instant Backup Shortcut Banner */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span>Quer fazer o backup agora sem configurar script?</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Você pode baixar o arquivo <strong>.xlsx formatado para o Google Planilhas</strong> com todas as receitas, despesas, faturas e membros em 5 abas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadSuccess ? 'Baixado com Sucesso!' : 'Baixar Arquivo de Backup'}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Code className="w-3.5 h-3.5" /> Ver Código do Script
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSaveAndSync}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora com Google Sheets'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-[11px]">
                  Cole este código no editor de Apps Script da sua planilha do Google Sheets:
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código Completo'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] leading-relaxed max-h-72 overflow-y-auto border border-slate-800 whitespace-pre">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Abra ou crie sua Planilha no Google Sheets</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Acesse <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> para criar uma nova planilha vazia.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Abra o Apps Script e cole o código</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      No menu superior do Google Sheets, vá em <strong>Extensões &gt; Apps Script</strong>. Apague o código padrão e cole o código da aba &quot;Código do Google Apps Script&quot;. Salve com Ctrl+S.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Implante como Aplicativo da Web</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Clique no botão azul <strong>Implantar &gt; Nova Implantação</strong> (canto superior direito). Em &quot;Tipo&quot;, escolha <strong>Aplicativo da Web</strong>. Defina <em>Quem tem acesso: Qualquer pessoa</em>. Clique em Implantar, copie a URL e cole na aba Configuração deste app!
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Entendi, ir para Configuração
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Backup Completo para Google Planilhas</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gere um arquivo de planilha consolidado contendo todos os seus dados organizados em 5 abas prontas para serem abertas ou importadas no <strong>Google Planilhas</strong> (Google Sheets) ou Excel:
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-slate-800">Aba Resumo:</strong>
                      <span className="text-slate-500 block">Saldo em caixa, saldo projetado, taxa de economia e alertas.</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-emerald-100 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-slate-800">Aba Transações:</strong>
                      <span className="text-slate-500 block">Todas as receitas, despesas e faturas cadastradas no sistema.</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-emerald-100 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-slate-800">Aba Contas a Pagar:</strong>
                      <span className="text-slate-500 block">Pendências com data de vencimento, multas previstas e código de barras.</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-emerald-100 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="text-slate-800">Aba Orçamentos:</strong>
                      <span className="text-slate-500 block">Limites por categoria, valor gasto e percentual atingido.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps to import into Google Sheets */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="font-bold text-slate-800 text-xs">
                  Como abrir este backup no Google Planilhas:
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Clique no botão verde abaixo para <strong>Baixar o Arquivo de Backup</strong> (.xlsx).</li>
                  <li>Acesse <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> no seu navegador ou abra o seu <strong>Google Drive</strong>.</li>
                  <li>No menu superior do Google Planilhas, vá em <strong>Arquivo &gt; Importar &gt; Fazer upload</strong> e arraste o arquivo baixado.</li>
                  <li>Todas as 5 abas e seus cálculos aparecerão prontos no seu Google Drive!</li>
                </ol>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  Total de {transactions.length} lançamento(s) incluído(s) no backup.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 text-slate-600 hover:text-slate-800 text-xs"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadSuccess ? '✓ Backup Baixado com Sucesso!' : 'Baixar Arquivo de Backup Google Planilhas'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

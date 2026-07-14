/**
 * @file Experiência única de chat partilhada pela página e pelo drawer.
 */

import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { firstLocalDayOfMonth, toLocalDateInputValue } from "../lib/dateUtils";
import {
  aiChatApi,
  type AiCapabilities,
  type AiChatMessage,
  type AiChatSession,
  type AiCompletedMessage,
} from "../lib/aiChatApi";
import { PageFrame, StatusMessage } from "../ui/opsaUi";
import { ConfirmableActionButton, ModalSurface } from "../ui/modal";
import { useAiPageContext } from "./AiPageContext";

interface AiChatState {
  capabilities: AiCapabilities | null;
  sessions: AiChatSession[];
  sessionId: string | null;
  messages: AiChatMessage[];
  from: string;
  to: string;
  busy: boolean;
  toolStatus: string | null;
  error: string | null;
  consent: { policyVersion: string; accepted: boolean } | null;
  hasOlderMessages: boolean;
  hasMoreSessions: boolean;
  selectSession: (id: string | null) => void;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  send: (message: string) => Promise<void>;
  cancel: () => void;
  removeCurrentSession: () => Promise<void>;
  toggleConsent: () => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
}

const AiChatStateContext = createContext<AiChatState | null>(null);

export function AiChatStateProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const auth = useAuth();
  const pageContext = useAiPageContext();
  const [capabilities, setCapabilities] = useState<AiCapabilities | null>(null);
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [from, setFrom] = useState(firstLocalDayOfMonth());
  const [to, setTo] = useState(toLocalDateInputValue());
  const [busy, setBusy] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<{ policyVersion: string; accepted: boolean } | null>(null);
  const [sessionCursor, setSessionCursor] = useState<string | null>(null);
  const [messageCursor, setMessageCursor] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const companyScope = auth.snapshot?.company?.id ?? null;

  const refreshCapabilities = useCallback(async () => {
    const result = await aiChatApi.capabilities();
    setCapabilities(result.capabilities);
    return result.capabilities;
  }, []);

  const refreshSessions = useCallback(async () => {
    const result = await aiChatApi.sessions();
    setSessions(result.sessions);
    setSessionCursor(result.pageInfo.nextCursor);
    setSessionId((current) => current ?? result.sessions[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    pageContext.clearTransaction();
    setSessions([]);
    setSessionId(null);
    setMessages([]);
    setSessionCursor(null);
    setMessageCursor(null);
    void refreshCapabilities().then(async (capability) => {
      if (!capability.chatAvailable) return;
      await Promise.all([
        refreshSessions(),
        aiChatApi.consent().then((result) => setConsent(result.consent)),
      ]);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Não foi possível iniciar o chat."));
    return () => abortRef.current?.abort();
  }, [companyScope, enabled, pageContext.clearTransaction, refreshCapabilities, refreshSessions]);

  useEffect(() => {
    if (!sessionId || !capabilities?.chatAvailable) {
      setMessages([]);
      setMessageCursor(null);
      return;
    }
    void aiChatApi.messages(sessionId).then((result) => {
      setMessages(result.messages);
      setMessageCursor(result.pageInfo.nextCursor);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Não foi possível carregar a conversa."));
  }, [capabilities?.chatAvailable, sessionId]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const created = await aiChatApi.createSession();
    setSessions((current) => [created.session, ...current]);
    setSessionId(created.session.id);
    return created.session.id;
  }

  async function send(message: string) {
    if (!message || busy || !capabilities?.chatAvailable) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: "user", text: message, status: "COMPLETED", provider: "local", createdAt: new Date().toISOString() }]);
    try {
      const currentSessionId = await ensureSession();
      await aiChatApi.send(currentSessionId, {
        message,
        context: {
          module: pageContext.module,
          entity: pageContext.entity,
          filters: pageContext.filters,
          period: { from, to },
          transaction: pageContext.transaction ? {
            documentType: pageContext.transaction.documentType,
            documentId: pageContext.transaction.documentId,
          } : undefined,
        },
      }, (streamEvent) => {
        if (streamEvent.event === "tool.started") setToolStatus("A consultar dados autorizados…");
        if (streamEvent.event === "tool.completed") setToolStatus("Dados validados.");
        if (streamEvent.event === "message.completed") {
          setMessages((current) => [...current, {
            ...(streamEvent.data as AiCompletedMessage),
            role: "assistant",
            status: streamEvent.data.status,
            provider: streamEvent.data.mode ?? "deterministic",
            createdAt: new Date().toISOString(),
          }]);
        }
        if (streamEvent.event === "message.cancelled") setError("A geração foi cancelada.");
        if (streamEvent.event === "message.failed") setError(streamEvent.data.message);
      }, controller.signal);
      await Promise.all([refreshSessions(), refreshCapabilities()]);
    } catch (caught) {
      setError(controller.signal.aborted ? "A geração foi cancelada." : caught instanceof Error ? caught.message : "Não foi possível gerar a resposta.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
      setToolStatus(null);
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  async function removeCurrentSession() {
    if (!sessionId) return;
    await aiChatApi.deleteSession(sessionId);
    setSessionId(null);
    setMessages([]);
    await refreshSessions();
  }

  async function toggleConsent() {
    if (consent?.accepted) await aiChatApi.revokeConsent();
    else await aiChatApi.acceptConsent();
    const [consentResult] = await Promise.all([aiChatApi.consent(), refreshCapabilities()]);
    setConsent(consentResult.consent);
  }

  async function loadOlderMessages() {
    if (!sessionId || !messageCursor) return;
    const result = await aiChatApi.messages(sessionId, messageCursor);
    setMessages((current) => [...result.messages, ...current]);
    setMessageCursor(result.pageInfo.nextCursor);
  }

  async function loadMoreSessions() {
    if (!sessionCursor) return;
    const result = await aiChatApi.sessions(sessionCursor);
    setSessions((current) => [...current, ...result.sessions]);
    setSessionCursor(result.pageInfo.nextCursor);
  }

  const value = useMemo<AiChatState>(() => ({
    capabilities, sessions, sessionId, messages, from, to, busy, toolStatus, error, consent,
    hasOlderMessages: Boolean(messageCursor), hasMoreSessions: Boolean(sessionCursor),
    selectSession: setSessionId, setFrom, setTo, send, cancel, removeCurrentSession,
    toggleConsent, loadOlderMessages, loadMoreSessions,
  }), [capabilities, sessions, sessionId, messages, from, to, busy, toolStatus, error, consent, messageCursor, sessionCursor, pageContext]);

  return <AiChatStateContext.Provider value={value}>{children}</AiChatStateContext.Provider>;
}

function useAiChatState() {
  const value = useContext(AiChatStateContext);
  if (!value) throw new Error("AiChatStateProvider em falta.");
  return value;
}

function formatRiskLevel(value: string) {
  return ({ LOW: "baixo", MEDIUM: "médio", HIGH: "alto", CRITICAL: "crítico" } as Record<string, string>)[value] ?? value;
}

function formatRecommendation(value: string) {
  return ({
    PROCEED: "prosseguir com validação humana",
    PROCEED_WITH_CAUTION: "prosseguir com cautela",
    REVIEW_BEFORE_PROCEEDING: "rever antes de prosseguir",
    DO_NOT_PROCEED_WITHOUT_REVIEW: "não prosseguir sem revisão",
  } as Record<string, string>)[value] ?? value;
}

function CapabilitySummary({ capability }: { capability: AiCapabilities | null }) {
  if (!capability) return <p>A validar disponibilidade…</p>;
  return (
    <details className="aiChat__capabilities">
      <summary>Estado do assistente</summary>
      <div className="aiChat__meta" aria-label="Estado do assistente">
        <span>Chat: {capability.chatAvailable ? "disponível" : "indisponível"}</span>
        <span>Modo determinístico: {capability.effectiveMode === "deterministic" ? "ativo" : "não ativo"}</span>
        <span>OpenAI configurada: {capability.providerConfigured ? "sim" : "não"}</span>
        <span>Empresa ativada: {capability.companyOptIn ? "sim" : "não"}</span>
        <span>Consentimento aceite: {capability.consentAccepted ? "sim" : "não"}</span>
      </div>
    </details>
  );
}

function ChatWorkspace({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  const pageContext = useAiPageContext();
  const chat = useAiChatState();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();
    if (!message) return;
    form.reset();
    await chat.send(message);
  }

  if (chat.capabilities && !chat.capabilities.chatAvailable) {
    return <StatusMessage tone="neutral" title="Chat indisponível">O chat de IA está desativado nesta instalação. As análises determinísticas e os registos existentes mantêm-se protegidos.</StatusMessage>;
  }

  return (
    <div className={`aiChat${compact ? " aiChat--compact" : ""}`}>
      <aside className="aiChat__sessions" aria-label="Conversas">
        <button type="button" onClick={() => chat.selectSession(null)}>Nova conversa</button>
        {chat.sessions.map((session) => (
          <button type="button" key={session.id} className={session.id === chat.sessionId ? "is-active" : ""} onClick={() => chat.selectSession(session.id)}>{session.title}</button>
        ))}
        {chat.hasMoreSessions ? <button type="button" onClick={() => void chat.loadMoreSessions()}>Carregar mais</button> : null}
      </aside>
      <section className="aiChat__main">
        <CapabilitySummary capability={chat.capabilities} />
        <p className="aiChat__company">Empresa: {auth.snapshot?.company?.name ?? "—"}</p>
        {pageContext.transaction ? (
          <div className="aiChat__transaction" aria-label="Documento em análise">
            <strong>{pageContext.transaction.documentType === "SALE" ? "Venda" : "Compra"}: {pageContext.transaction.label}</strong>
            <button type="button" onClick={pageContext.clearTransaction}>Remover contexto</button>
          </div>
        ) : null}
        <details className="aiChat__privacy">
          <summary>Privacidade e limites</summary>
          <p>Os cálculos, números e fontes são sempre produzidos pela OPSA. Quando autorizado, o provider recebe apenas intenção e sinais qualitativos, sem pergunta livre, histórico, identificadores ou valores.</p>
          {chat.consent?.accepted ? (
            <ConfirmableActionButton label="Revogar consentimento" description="O provider externo deixa de poder ser usado até existir novo consentimento." busy={chat.busy} onConfirm={chat.toggleConsent} />
          ) : (
            <button type="button" onClick={() => void chat.toggleConsent()}>{`Aceitar política ${chat.consent?.policyVersion ?? "atual"}`}</button>
          )}
        </details>
        <div className="aiChat__period">
          <label>De <input type="date" value={chat.from} onChange={(event) => chat.setFrom(event.target.value)} /></label>
          <label>Até <input type="date" value={chat.to} onChange={(event) => chat.setTo(event.target.value)} /></label>
        </div>
        <div className="aiChat__messages" aria-live="polite" aria-busy={chat.busy}>
          {chat.hasOlderMessages ? <button type="button" onClick={() => void chat.loadOlderMessages()}>Carregar anteriores</button> : null}
          {chat.messages.length === 0 ? <p className="empty">Pergunta sobre cashflow, clientes, stock, margem, KPIs ou insights.</p> : null}
          {chat.messages.map((message) => (
            <article key={message.id} className={`aiChatMessage aiChatMessage--${message.role}`}>
              <strong>{message.role === "user" ? "Tu" : "Assistente OPSA"}</strong>
              <p>{message.text ?? message.answer}</p>
              {message.role === "assistant" ? <small>Modo: {message.mode ?? message.provider}{message.model ? ` · ${message.model}` : ""}</small> : null}
              {message.analysis ? (
                <section aria-label={`Análise de risco de ${message.analysis.document.number}`}>
                  <p><strong>Risco:</strong> {formatRiskLevel(message.analysis.riskLevel)} · <strong>Recomendação:</strong> {formatRecommendation(message.analysis.recommendation)}</p>
                  {message.analysis.riskFactors.length ? <details open><summary>Riscos identificados</summary><ul>{message.analysis.riskFactors.map((factor) => <li key={factor.code}><strong>{factor.label}:</strong> {factor.explanation}</li>)}</ul></details> : <p>Não foram identificados fatores de risco materiais pelas regras disponíveis.</p>}
                  <details><summary>Ações futuras para revisão humana</summary><ul>{message.analysis.futureActions.map((action) => <li key={action}>{action}</li>)}</ul></details>
                  <p><small>{message.analysis.guardrail}</small></p>
                </section>
              ) : null}
              {message.facts?.length ? <details><summary>Factos validados</summary><ul>{message.facts.map((fact) => <li key={fact.id}>{fact.metric}: {fact.formattedValue}</li>)}</ul></details> : null}
              {message.limitations?.length ? <ul>{message.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul> : null}
              {message.sources?.length ? <details><summary>Fontes</summary><ul>{message.sources.map((source) => <li key={source.ref}>{source.label}</li>)}</ul></details> : null}
              {message.role === "assistant" && !message.id.startsWith("local-") ? <div><button type="button" onClick={() => void aiChatApi.feedback(message.id, "USEFUL")}>Útil</button> <button type="button" onClick={() => void aiChatApi.feedback(message.id, "NOT_USEFUL")}>Não útil</button></div> : null}
            </article>
          ))}
          {chat.toolStatus ? <p className="aiChat__status">{chat.toolStatus}</p> : null}
        </div>
        {chat.error ? <StatusMessage tone="danger" title="Estado do chat">{chat.error}</StatusMessage> : null}
        <form className="aiChat__composer" onSubmit={submit}>
          <label><span>Pergunta</span><textarea name="message" rows={compact ? 2 : 3} required maxLength={2000} disabled={chat.busy} /></label>
          <div>
            <button type="submit" disabled={chat.busy}>{chat.busy ? "A responder…" : "Enviar"}</button>
            {chat.busy ? <button type="button" onClick={chat.cancel}>Cancelar</button> : null}
            {chat.sessionId ? <ConfirmableActionButton label="Apagar conversa" description="A conversa é eliminada; a auditoria conserva apenas um hash irreversível." entityLabel={chat.sessions.find((session) => session.id === chat.sessionId)?.title ?? chat.sessionId} busy={chat.busy} onConfirm={chat.removeCurrentSession} /> : null}
          </div>
        </form>
      </section>
    </div>
  );
}

export function AiChatPage() {
  return <PageFrame title="Assistente OPSA" description="Chat contextual read-only, sustentado exclusivamente por dados validados da empresa."><ChatWorkspace /></PageFrame>;
}

export function AiAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const chat = useAiChatState();
  function close() {
    if (chat.busy) chat.cancel();
    setOpen(false);
  }
  if (chat.capabilities && !chat.capabilities.chatAvailable) return null;
  return (
    <>
      <button type="button" className="aiLauncher" aria-expanded={open} onClick={() => setOpen(true)}>Assistente OPSA</button>
      <ModalSurface open={open} title="Assistente OPSA" variant="drawer" onClose={close}><ChatWorkspace compact /></ModalSurface>
    </>
  );
}

export function AiSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [policyVersion, setPolicyVersion] = useState("2026-01");
  const [userLimit, setUserLimit] = useState(50);
  const [companyLimit, setCompanyLimit] = useState(500);
  const [ruleThresholds, setRuleThresholds] = useState<Record<string, number>>({});
  const [providerState, setProviderState] = useState("disabled");
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => { void aiChatApi.settings().then((data) => {
    const settings = (data.settings ?? {}) as Record<string, unknown>;
    const provider = (data.provider ?? {}) as Record<string, unknown>;
    const registry = (data.registry ?? {}) as Record<string, { defaultThreshold?: number }>;
    const storedRules = Array.isArray(data.rules) ? data.rules as Array<{ ruleCode: string; parameters?: { threshold?: number } }> : [];
    setEnabled(Boolean(settings.openAiEnabled));
    if (typeof settings.policyVersion === "string") setPolicyVersion(settings.policyVersion);
    if (typeof settings.userDailyTurnLimit === "number") setUserLimit(settings.userDailyTurnLimit);
    if (typeof settings.companyDailyTurnLimit === "number") setCompanyLimit(settings.companyDailyTurnLimit);
    setProviderState(`${String(provider.mode ?? "disabled")} · ${provider.configured ? "configurado" : "sem chave"} · ${String(provider.model ?? "—")}`);
    setRuleThresholds(Object.fromEntries(Object.entries(registry).map(([code, rule]) => [code, storedRules.find((stored) => stored.ruleCode === code)?.parameters?.threshold ?? rule.defaultThreshold ?? 0])));
  }).catch((caught) => setStatus(caught instanceof Error ? caught.message : "Erro ao carregar definições.")); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await aiChatApi.updateSettings({ openAiEnabled: enabled, policyVersion, userDailyTurnLimit: userLimit, companyDailyTurnLimit: companyLimit, rules: Object.entries(ruleThresholds).map(([ruleCode, threshold]) => ({ ruleCode, threshold, enabled: true })) });
    setStatus("Definições guardadas. O provider só será usado após consentimento individual válido.");
  }
  return <PageFrame title="Administração da IA" description="Opt-in da empresa, versão de política e limites seguros definidos no backend."><StatusMessage tone="neutral" title="Provider global">{providerState}</StatusMessage><form className="operation" onSubmit={save}><label><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Ativar OpenAI nesta empresa</label><label><span>Versão da política</span><input value={policyVersion} pattern="\d{4}-\d{2}" onChange={(event) => setPolicyVersion(event.target.value)} /></label><div className="fields"><label><span>Turnos/dia por utilizador</span><input type="number" min={1} max={500} value={userLimit} onChange={(event) => setUserLimit(Number(event.target.value))} /></label><label><span>Turnos/dia por empresa</span><input type="number" min={1} max={5000} value={companyLimit} onChange={(event) => setCompanyLimit(Number(event.target.value))} /></label></div><fieldset><legend>Thresholds das regras</legend>{Object.entries(ruleThresholds).map(([code, threshold]) => <label key={code}><span>{code}</span><input type="number" value={threshold} onChange={(event) => setRuleThresholds((current) => ({ ...current, [code]: Number(event.target.value) }))} /></label>)}</fieldset><button type="submit">Guardar</button></form>{status ? <StatusMessage tone="neutral" title="Estado">{status}</StatusMessage> : null}</PageFrame>;
}

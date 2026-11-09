import React, { FormEvent, useEffect, useRef, useState } from "react";
import { trackEvent } from "./analytics";
import { Bot, MessageCircle, Send, Sparkles, X, ArrowUpRight } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };
const WHATSAPP_NUMBER = "59176192899";
const quick = ["¿Qué hace Automata?", "¿Hacen publicidad con IA?", "Tengo un negocio de vinos", "Quiero automatizar pedidos por WhatsApp"];
const CHAT_API_URL = "https://automata-chat.dgckg-trd1.workers.dev";
const LOCAL_SESSION_ID = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function normalize(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function requestsHumanHandoff(value: string) {
  const text = normalize(value);
  const person = /\b(humano|humana|humnao|humna|umano|persona|personas|asesor|asesora|agente|equipo|alguien)\b/.test(text);
  const contactIntent = /\b(hablar|contactar|comunicarme|comunicar|pasar|derivar|conectar|llamar|llamada|whatsapp)\b/.test(text);
  const directRequest = /\b(quiero|quisiera|necesito|puedo|podria|prefiero)\b.{0,45}\b(hablar|contactar|comunicarme|comunicar|pasar|derivar|conectar|llamar|llamada)\b/.test(text);
  const wantsPersonDirectly = /\b(quiero|quisiera|necesito)\s+(un|una)\s+(humano|humana|humnao|persona|asesor|asesora|agente)\b/.test(text);
  const explicitWhatsAppHandoff = /\b(continuar|pasar|ir|seguir)\b.{0,25}\bwhatsapp\b/.test(text);
  return (person && contactIntent) || (directRequest && (person || /\b(whatsapp|equipo)\b/.test(text))) || wantsPersonDirectly || explicitWhatsAppHandoff;
}

function buildHandoffSummary(messages: Message[]) {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => message.text.trim())
    .filter((message) => message.length > 12 && !requestsHumanHandoff(message));
  const allText = userMessages.join(" ");
  const normalized = normalize(allText);
  const compact = (value: string, max = 120) => {
    const cleaned = value.replace(/\s+/g, " ").replace(/^[\s,;:.!?¿¡-]+|[\s,;:.!?¿¡-]+$/g, "").trim();
    return cleaned.length > max ? cleaned.slice(0, max - 1).trimEnd() + "…" : cleaned;
  };
  const firstMatch = (patterns: RegExp[]) => {
    for (const message of userMessages) {
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match?.[1]) return compact(match[1]);
      }
    }
    return "";
  };

  const business = firstMatch([
    /(?:soy propietario(?: de)?|soy dueño(?: de)?|tengo (?:un|una)|mi negocio es|me dedico a)\s+([^.!?]+)/i,
    /(?:empresa de|negocio de|servicio de)\s+([^.!?]+)/i
  ]);
  const expansion = firstMatch([
    /(?:me estoy expandiendo|nos estamos expandiendo|expansión)\s+(?:de\s+)?([^,.!?]+?\s+a\s+[^,.!?]+)/i,
    /(?:abrir|llegar|expandirme|expandirnos)\s+(?:de\s+)?([^,.!?]+?\s+a\s+[^,.!?]+)/i
  ]);
  const objective = firstMatch([
    /(?:necesito|quiero|busco|mi objetivo es|me gustaría)\s+(.{1,100}?)(?:\s+(?:ya que|porque|debido a|para)\b|[,!.?]|$)/i,
    /(?:ampliar|expandir|aumentar|captar)\s+(.{1,90}?)(?:\s+(?:ya que|porque|debido a|para)\b|[,!.?]|$)/i
  ]);
  const problem = firstMatch([
    /(?:pierdo|estoy perdiendo|se me escapan|no logro)\s+(.{1,100}?)(?:[,!.?]|$)/i
  ]);
  const budgetMatch = allText.match(/(?:presupuesto|cuento con|dispongo de)[^.!?]{0,45}?(\d[\d.,\s]*\s?(?:bs\.?|bolivianos))/i)
    || allText.match(/(\d[\d.,\s]*\s?(?:bs\.?|bolivianos))/i);
  const cities = ["Sucre", "Potosí", "Tarija", "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Beni", "Pando"].filter((city) =>
    new RegExp("\\b" + city.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "\\b", "i").test(normalized)
  );
  const needs: string[] = [];
  const needRules: Array<[RegExp, string]> = [
    [/\b(web|pagina web|sitio web)\b/, "Página web"],
    [/\b(cita|citas|agenda|reservas)\b/, "Agenda y distribución de citas"],
    [/\b(inventario|repuestos|stock)\b/, "Control de inventario de repuestos"],
    [/\b(whatsapp|pedidos)\b/, "Atención por WhatsApp"],
    [/\b(publicidad|campana|anuncios)\b/, "Publicidad y captación"],
    [/\b(chatbot|asistente|automatizacion)\b/, "Asistente o automatización"]
  ];
  for (const [pattern, label] of needRules) if (pattern.test(normalized)) needs.push(label);

  const askedForHuman = messages.some((message) => message.role === "user" && requestsHumanHandoff(message));
  const askedAboutPricing = /\b(precio|precios|cotizacion|cotizar|costo|costos|presupuesto)\b/.test(normalized);
  const lines = [
    "FICHA COMERCIAL | AUTOMATA",
    business ? "Negocio: " + business : "",
    expansion ? "Expansión: " + expansion : (cities.length ? "Mercado: " + cities.join(", ") : ""),
    objective ? "Objetivo: " + objective : "",
    problem ? "Problema: " + problem : "",
    needs.length ? "Solución solicitada: " + needs.join("; ") : "",
    budgetMatch ? "Presupuesto indicado: " + compact(budgetMatch[1], 50) : "",
    askedForHuman
      ? "Siguiente paso: contacto humano para continuar el diagnóstico y revisar alcance/precio."
      : (askedAboutPricing ? "Siguiente paso: aclarar alcance y preparar una cotización." : "Siguiente paso: continuar el diagnóstico comercial."),
    "Nota interna: datos resumidos de lo compartido por el cliente; confirmar cualquier detalle pendiente."
  ].filter(Boolean);
  if (!business && !objective && !needs.length && !budgetMatch && !cities.length && !problem) {
    const lastSubstantive = [...userMessages].reverse().find((message) => message.length > 25);
    lines.splice(1, 0, "Motivo: " + (lastSubstantive ? compact(lastSubstantive, 160) : "El visitante solicita contacto con el equipo."));
  }
  return lines.join("\n");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "¡Hola! Soy el asistente virtual de Automata. Puedo contarte qué hacemos y ayudarte a identificar oportunidades para tu negocio. ¿Qué necesitas resolver?" }]);
  const [handoffText, setHandoffText] = useState("");
  const [shareConsent, setShareConsent] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [handoffRequested, setHandoffRequested] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const sessionId = useRef(LOCAL_SESSION_ID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => { trackEvent("chat_open"); setOpen(true); };
    window.addEventListener("automata:open-chat", show);
    return () => window.removeEventListener("automata:open-chat", show);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, open, handoffText, isThinking]);

  const send = async (value = input) => {
    const text = value.trim();
    if (!text || isThinking) return;
    const normalizedText = text.toLocaleLowerCase("es");
    const category = /publicidad|video|anuncio|campaña/.test(normalizedText) ? "publicidad"
      : /sitio web|página web|pagina web|web/.test(normalizedText) ? "web"
      : /asistente|chatbot|atención|atencion/.test(normalizedText) ? "asistentes"
      : /automatiz|proceso|integración|integracion/.test(normalizedText) ? "automatizacion"
      : /pedido|reserva|cita|whatsapp/.test(normalizedText) ? "pedidos" : "otro";
    trackEvent("chat_message", category);
    const conversation: Message[] = [...messages, { role: "user", text }];
    setMessages(conversation);
    setShareConsent(false);
    const requestsHuman = requestsHumanHandoff(text);
    if (requestsHuman) {
      setHandoffRequested(true);
      setShowHandoff(true);
      setHandoffText(buildHandoffSummary(conversation));
      setMessages([...conversation, { role: "bot", text: "Claro. Dejemos la conversación directamente al equipo. Preparé un resumen editable con lo que ya compartiste; revísalo y autoriza compartirlo para continuar por WhatsApp." }]);
      setInput("");
      setIsThinking(false);
      return;
    }
    const previousBotMessage = [...messages].reverse().find((message) => message.role === "bot")?.text ?? "";
    const affirmative = /^(si|sí|si por favor|sí por favor|de acuerdo|adelante|por supuesto)[.!\s]*$/i.test(text);
    const authorization = /^(autorizo|lo autorizo|autorizo el envío|autorizo compartir)[.!\s]*$/i.test(text);
    if (handoffRequested && affirmative && /resumen/i.test(previousBotMessage)) setShowHandoff(true);
    if (handoffRequested && authorization) {
      setShowHandoff(true);
      setMessages([...conversation, { role: "bot", text: "Tu autorización por escrito no envía la solicitud. Para compartirla, revisa el resumen, marca la casilla de autorización y pulsa «Continuar por WhatsApp». WhatsApp se abrirá para que confirmes el envío desde tu dispositivo." }]);
      setHandoffText(buildHandoffSummary(conversation));
      setIsThinking(false);
      return;
    }
    setShowHandoff(false);
    setInput("");
    setIsThinking(true);

    let answer = "";
    try {
        const response = await fetch(`${CHAT_API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Chat-Session": sessionId.current
          },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            messages: (() => {
              const recent = conversation.slice(1).slice(-20);
              if (recent[0]?.role === "bot") recent.shift();
              return recent.map((message) => ({
                role: message.role === "user" ? "user" : "model",
                text: message.text
              }));
            })()
          })
        });
        const payload = await response.json().catch(() => ({})) as { answer?: string; error?: string };
        if (!response.ok || !payload.answer) {
          throw new Error(payload.error || "No pudimos procesar tu consulta. Inténtalo nuevamente.");
        }
        answer = payload.answer;
    } catch (error) {
      console.error("Automata chat request failed:", error);
      answer = "No pudimos conectar con el asistente de IA. Tu mensaje no se procesó; inténtalo nuevamente en unos minutos.";
    }

    const completedMessages: Message[] = [...conversation, { role: "bot", text: answer }];
    setMessages(completedMessages);
    setHandoffText(buildHandoffSummary(completedMessages));
    setIsThinking(false);
  };

  const submit = (event: FormEvent) => { event.preventDefault(); send(); };

  const userMessages = messages.filter((message) => message.role === "user");
  const lastUserMessage = userMessages[userMessages.length - 1]?.text ?? "";
  const explicitHandoffRequest = requestsHumanHandoff(lastUserMessage);
  const canOfferHandoff = handoffRequested || explicitHandoffRequest;

  const continueOnWhatsApp = () => {
    if (!shareConsent || !handoffText.trim()) return;
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(handoffText.trim());
    trackEvent("whatsapp_click");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="automata-chat-root">
      {open && <section className="automata-chat-panel" role="dialog" aria-modal="false" aria-label="Asistente virtual de Automata">
        <header className="automata-chat-header">
          <span className="automata-chat-avatar"><Bot size={22} /></span>
          <div><strong>Autómata</strong><small>Asistente virtual de Automata</small></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="automata-chat-close"><X size={20} /></button>
        </header>
        <div className="automata-chat-messages" aria-live="polite">
          {messages.map((message, index) => <div key={index} className={`automata-chat-message ${message.role}`}>{message.text}</div>)}
          {messages.length === 1 && <div className="automata-chat-quick">{quick.map((question) => <button key={question} type="button" disabled={isThinking} onClick={() => send(question)}>{question}</button>)}</div>}
          {canOfferHandoff && !showHandoff && <button type="button" className="automata-handoff-button" onClick={() => setShowHandoff(true)}>Preparar resumen para WhatsApp</button>}
          {showHandoff && <section className="automata-handoff">
            <div className="automata-handoff-heading"><strong>Continúa sin repetir tu historia</strong><span>Tu resumen para WhatsApp</span></div>
            <button type="button" className="automata-handoff-back" onClick={() => setShowHandoff(false)}>Volver a conversar</button>
            <p className="automata-handoff-copy">Revisa y edita lo que compartiremos con el equipo de Automata. Solo se enviará si marcas tu autorización y pulsas el botón.</p>
            <textarea aria-label="Resumen editable para WhatsApp" value={handoffText} onChange={(event) => { setHandoffText(event.target.value); setShareConsent(false); }} rows={8} />
            <label className="automata-handoff-consent"><input type="checkbox" checked={shareConsent} onChange={(event) => setShareConsent(event.target.checked)} /> Autorizo compartir este resumen y los mensajes incluidos con el equipo de Automata por WhatsApp.</label>
            <button type="button" className="automata-handoff-button" onClick={continueOnWhatsApp} disabled={!shareConsent || !handoffText.trim()}><MessageCircle size={17} /> Continuar por WhatsApp <ArrowUpRight size={16} /></button>
          </section>}
          {isThinking && <div className="automata-chat-message bot" role="status">Autómata está pensando...</div>}
          <div ref={bottomRef} />
        </div>
        <form className="automata-chat-compose" onSubmit={submit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu consulta..." aria-label="Escribe tu consulta" maxLength={1800} disabled={isThinking} />
          <button type="submit" disabled={!input.trim() || isThinking} aria-label="Enviar mensaje"><Send size={18} /></button>
        </form>
        <p className="automata-chat-note"><Sparkles size={12} /> Asistente con IA de Automata · proveedores alternativos. No incluyas datos sensibles. Escribir una autorización en el chat no envía mensajes; el envío se inicia al pulsar Continuar por WhatsApp.</p>
      </section>}
      <button type="button" className="automata-chat-launcher" onClick={() => { if (!open) trackEvent("chat_open"); setOpen((value) => !value); }} aria-label={open ? "Cerrar asistente" : "Abrir asistente"}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span>¿Hablamos?</span>}
      </button>
    </div>
  );
}

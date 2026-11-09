import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X, ArrowUpRight } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };
const WHATSAPP_NUMBER = "59176192899";
const quick = ["¿Qué hace Automata?", "¿Hacen publicidad con IA?", "Tengo un negocio de vinos", "Quiero automatizar pedidos por WhatsApp"];
const CHAT_API_URL = "https://automata-chat.dgckg-trd1.workers.dev";
const LOCAL_SESSION_ID = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function normalize(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9\\s]/g, " ").replace(/\\s+/g, " ").trim();
}

function buildHandoffSummary(messages: Message[]) {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => message.text.trim())
    .filter(Boolean);
  const lines = [
    "Hola, equipo de Automata. Quiero continuar una consulta que inicié en su asistente web.",
    "",
    "CONTEXTO COMPARTIDO",
    "Se incluyen hasta los ocho mensajes más recientes que escribí en el asistente, para que el equipo pueda continuar la conversación sin pedirme que repita esa parte del contexto."
  ];
  lines.push("", "MENSAJES DEL CLIENTE");
  userMessages.slice(-8).forEach((message) => {
    const excerpt = message.length > 400 ? message.slice(0, 397) + "..." : message;
    lines.push("• " + excerpt);
  });
  lines.push("", "Quisiera continuar la conversación y recibir orientación sobre el siguiente paso.");
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
    const show = () => setOpen(true);
    window.addEventListener("automata:open-chat", show);
    return () => window.removeEventListener("automata:open-chat", show);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, open, handoffText, isThinking]);

  const send = async (value = input) => {
    const text = value.trim();
    if (!text || isThinking) return;
    const conversation: Message[] = [...messages, { role: "user", text }];
    setMessages(conversation);
    setShareConsent(false);
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
    if (/(humano|persona|asesor|equipo|hablar con alguien|contactar)/i.test(normalize(text))) setHandoffRequested(true);
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
  const explicitHandoffRequest = /(quiero (hablar|contactar|pasar|comunicarme)|necesito (hablar|contactar|comunicarme)|contactar (con|al)|hablar con (alguien|una persona|un asesor|el equipo|un humano|algun humano)|humano|persona del equipo|pasar a whatsapp|continuar por whatsapp|ir a whatsapp|comunicarme con|asesor)/i.test(normalize(lastUserMessage));
  const canOfferHandoff = handoffRequested || explicitHandoffRequest;

  const continueOnWhatsApp = () => {
    if (!shareConsent || !handoffText.trim()) return;
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(handoffText.trim());
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
        <p className="automata-chat-note"><Sparkles size={12} /> Asistente con IA de Automata · OpenRouter. No incluyas datos sensibles. Escribir una autorización en el chat no envía mensajes; el envío se inicia al pulsar Continuar por WhatsApp.</p>
      </section>}
      <button type="button" className="automata-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar asistente" : "Abrir asistente"}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span>¿Hablamos?</span>}
      </button>
    </div>
  );
}

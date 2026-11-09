import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };
type Intent = { id: string; phrases: string[]; terms: string[]; answer: string };

const intents: Intent[] = [
  {
    id: "about",
    phrases: ["que hace automata", "que es automata", "que hacen en automata", "a que se dedica automata", "que ofrece automata", "cuales son sus servicios"],
    terms: ["servicios", "ofrecen", "dedican"],
    answer: "Automata diseña y desarrolla soluciones digitales para que los negocios atiendan mejor y pierdan menos tiempo en tareas repetitivas. Trabajamos con asistentes digitales, flujos de pedidos y reservas, sitios web, integraciones y automatización de procesos. Primero entendemos el problema; después proponemos la solución adecuada."
  },
  {
    id: "whatsapp",
    phrases: ["pedidos por whatsapp", "vender por whatsapp", "recibir pedidos", "organizar pedidos"],
    terms: ["whatsapp", "pedidos", "pedido", "menu", "catalogo"],
    answer: "Podemos diseñar un flujo para recibir consultas y pedidos por WhatsApp, organizar productos, cantidades y observaciones, y preparar un resumen claro para el negocio. La aceptación del pedido siempre depende del negocio. Nuestro producto de pedidos está en etapa de validación, así que primero evaluamos el proceso y el alcance."
  },
  {
    id: "web",
    phrases: ["pagina web", "sitio web", "hacer una web", "crear una pagina", "diseñar una web"],
    terms: ["web", "landing", "pagina", "sitio"],
    answer: "Sí. Diseñamos sitios web para presentar tu negocio, explicar tus servicios, captar consultas y conectar canales como WhatsApp. El alcance depende de lo que necesites: una web institucional no es lo mismo que una plataforma con usuarios, pagos o panel administrativo."
  },
  {
    id: "assistant",
    phrases: ["asistente virtual", "preguntas frecuentes", "responder automaticamente", "bot para mi negocio", "chat para mi pagina"],
    terms: ["asistente", "chatbot", "bot", "responder"],
    answer: "Podemos desarrollar asistentes digitales para responder consultas con información aprobada, orientar a clientes y derivar casos a una persona. Si necesita consultar sistemas, disponibilidad o datos privados, primero evaluamos las integraciones y las medidas de seguridad."
  },
  {
    id: "booking",
    phrases: ["agendar una cita", "reservar una cita", "sistema de reservas", "tomar reservas"],
    terms: ["reserva", "reservas", "cita", "agenda", "turno"],
    answer: "Podemos diseñar un flujo de solicitudes de citas o reservas, con selección de servicio y datos necesarios. Para confirmar horarios en tiempo real hace falta una fuente de disponibilidad conectada; sin ella, el asistente solo puede recibir una solicitud, no confirmar una cita."
  },
  {
    id: "automation",
    phrases: ["automatizar mi negocio", "automatizar tareas", "ahorrar tiempo", "tareas repetitivas", "automatizar procesos"],
    terms: ["automatizacion", "automatizar", "proceso", "reportes", "registro"],
    answer: "Automatizamos tareas repetitivas como clasificar consultas, ordenar registros, generar reportes y enviar avisos. Para recomendar algo concreto necesitamos conocer el proceso actual, las herramientas que usa tu equipo y qué resultado esperas."
  },
  {
    id: "ai",
    phrases: ["inteligencia artificial", "usan inteligencia artificial", "trabajan con ia"],
    terms: ["ia", "gemini", "modelo"],
    answer: "Usamos IA cuando aporta valor: por ejemplo, para interpretar mensajes, clasificar consultas o resumir información. Las reglas críticas, los cálculos y las validaciones deben quedar bajo control del software, no de una respuesta improvisada del modelo."
  },
  {
    id: "price",
    phrases: ["cuanto cuesta", "cual es el precio", "cuanto cobran", "que precio tiene", "necesito una cotizacion"],
    terms: ["precio", "cotizacion", "presupuesto", "cobran", "costo"],
    answer: "No tenemos un precio universal. Cada proyecto se cotiza según alcance, integraciones, volumen de uso, mantenimiento y costos de servicios externos. Cuéntanos qué necesitas y podemos preparar una evaluación antes de hablar de cifras."
  },
  {
    id: "timing",
    phrases: ["cuanto demora", "cuanto tarda", "cuando estaria listo", "cual es el plazo"],
    terms: ["demora", "tarda", "plazo", "tiempo"],
    answer: "El plazo depende del alcance y de las integraciones necesarias. Primero definimos qué debe hacer la solución, qué sistemas intervienen y cómo se comprobará que funciona. No sería serio prometerte una fecha sin revisar eso."
  },
  {
    id: "health",
    phrases: ["para un consultorio", "para una clinica", "sistema para pacientes"],
    terms: ["salud", "consultorio", "clinica", "paciente"],
    answer: "Podemos evaluar herramientas administrativas para consultorios, como solicitudes de cita e información general. No diseñamos asistentes para diagnosticar ni sustituir al personal sanitario, y los datos de salud requieren controles especiales."
  },
  {
    id: "contact",
    phrases: ["hablar con alguien", "quiero un asesor", "contactar al equipo", "hablar con una persona"],
    terms: ["humano", "asesor", "contacto", "persona"],
    answer: "Puedes continuar por WhatsApp y contarle tu caso al equipo de Automata. El botón de contacto abrirá una conversación con un mensaje preparado para que lo revises antes de enviarlo."
  }
];

const quick = ["¿Qué hace Automata?", "Quiero automatizar pedidos por WhatsApp", "Necesito una página web", "¿Cuánto cuesta?"];
const fallback = "No quiero darte una respuesta al azar. Puedo orientarte sobre lo que hacemos: asistentes digitales, WhatsApp y pedidos, sitios web, reservas, automatización e IA. Cuéntame un poco más sobre el resultado que buscas o contacta al equipo por WhatsApp.";

function normalize(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function answerFor(input: string) {
  const normalized = normalize(input);
  const tokens = new Set(normalized.split(" ").filter(Boolean));
  if (!normalized) return fallback;

  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)$/.test(normalized)) {
    return "¡Hola! Puedo contarte qué hace Automata o ayudarte a identificar una solución para tu negocio. ¿Qué te gustaría resolver?";
  }
  if (/(gracias|muchas gracias)/.test(normalized)) {
    return "¡Con gusto! Si quieres, cuéntame qué proceso de tu negocio te gustaría mejorar y te orientaré sobre el siguiente paso.";
  }

  const ranked = intents.map((intent) => {
    const phraseScore = intent.phrases.reduce((score, phrase) => normalized.includes(normalize(phrase)) ? score + 4 : score, 0);
    const termScore = intent.terms.reduce((score, term) => tokens.has(normalize(term)) ? score + (term.length <= 3 ? 2 : 1) : score, 0);
    return { intent, score: phraseScore + termScore };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  if (best && best.score >= 2 && (!second || best.score > second.score)) return best.intent.answer;
  return fallback;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "¡Hola! Soy el asistente virtual de Automata. Puedo contarte qué hacemos y ayudarte a aterrizar una idea. ¿Qué necesitas resolver?" }]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("automata:open-chat", show);
    return () => window.removeEventListener("automata:open-chat", show);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, open]);

  const send = (value = input) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }, { role: "bot", text: answerFor(text) }]);
    setInput("");
  };

  const submit = (event: FormEvent) => { event.preventDefault(); send(); };

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
          {messages.length === 1 && <div className="automata-chat-quick">{quick.map((question) => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}</div>}
          <div ref={bottomRef} />
        </div>
        <form className="automata-chat-compose" onSubmit={submit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu consulta..." aria-label="Escribe tu consulta" />
          <button type="submit" disabled={!input.trim()} aria-label="Enviar mensaje"><Send size={18} /></button>
        </form>
        <p className="automata-chat-note"><Sparkles size={12} /> Respuestas orientativas. Los proyectos se confirman tras evaluar su alcance.</p>
      </section>}
      <button type="button" className="automata-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar asistente" : "Abrir asistente"}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span>¿Hablamos?</span>}
      </button>
    </div>
  );
}

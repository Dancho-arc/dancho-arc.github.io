import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X, ArrowUpRight } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };
type Intent = { id: string; phrases: string[]; terms: string[]; answer: string };

const WHATSAPP_NUMBER = "59176192899";

const intents: Intent[] = [
  {
    id: "about",
    phrases: ["que hace automata", "que es automata", "que hacen en automata", "a que se dedica automata", "que ofrece automata", "cuales son sus servicios", "que otros servicios ofrecen", "ademas de automatizar"],
    terms: ["servicios", "ofrecen", "dedican"],
    answer: "Automata combina tecnología y creatividad para resolver necesidades reales de los negocios. Desarrollamos asistentes digitales, atención y flujos por WhatsApp, sitios web, catálogos, solicitudes de pedidos y reservas, automatización de procesos, integraciones y soluciones con IA. También trabajamos publicidad audiovisual con apoyo de IA, producción híbrida y campañas publicitarias. Primero entendemos tu objetivo y luego definimos el alcance adecuado."
  },
  {
    id: "marketing",
    phrases: ["publicidad con ia", "publicidad con inteligencia artificial", "anuncios con ia", "campana publicitaria", "campanas publicitarias", "hacer publicidad", "video publicitario", "publicidad audiovisual", "contenido para redes", "marketing digital"],
    terms: ["publicidad", "campana", "campanas", "anuncios", "audiovisual"],
    answer: "Sí. Podemos desarrollar conceptos publicitarios, textos, imágenes y piezas audiovisuales con apoyo de IA. También podemos combinar grabación real, edición tradicional y recursos generados con IA para crear campañas y adaptar contenidos a distintos canales. Para orientarte bien necesitamos conocer tu producto o servicio, el público al que quieres llegar y dónde piensas difundir la campaña."
  },
  {
    id: "whatsapp",
    phrases: ["pedidos por whatsapp", "vender por whatsapp", "recibir pedidos", "organizar pedidos", "atender clientes por whatsapp"],
    terms: ["whatsapp", "pedidos", "pedido", "menu", "catalogo"],
    answer: "Podemos diseñar una experiencia para recibir consultas y solicitudes de pedidos por WhatsApp, ordenar productos, cantidades y observaciones, y entregar un resumen claro al negocio. La confirmación y aceptación del pedido siguen bajo control del negocio. Primero revisamos cómo vendes hoy y qué herramientas utilizas."
  },
  {
    id: "web",
    phrases: ["pagina web", "sitio web", "hacer una web", "crear una pagina", "disenar una web"],
    terms: ["web", "landing", "pagina", "sitio"],
    answer: "Sí. Diseñamos sitios web para presentar tu negocio, explicar tus servicios, mostrar productos, captar consultas y conectar canales como WhatsApp. El alcance depende de lo que necesites: una web institucional no es lo mismo que una tienda en línea o una plataforma con usuarios y pagos."
  },
  {
    id: "assistant",
    phrases: ["asistente virtual", "preguntas frecuentes", "responder automaticamente", "bot para mi negocio", "chat para mi pagina"],
    terms: ["asistente", "chatbot", "bot", "responder"],
    answer: "Podemos desarrollar asistentes digitales para responder consultas con información aprobada, orientar a clientes y derivar casos a una persona. También podemos transferir el contexto de la conversación para que el cliente no tenga que explicar todo otra vez. Si el asistente necesita consultar sistemas o datos privados, primero evaluamos las integraciones y las medidas de seguridad."
  },
  {
    id: "booking",
    phrases: ["agendar una cita", "reservar una cita", "sistema de reservas", "tomar reservas"],
    terms: ["reserva", "reservas", "cita", "agenda", "turno"],
    answer: "Podemos diseñar un flujo para recibir solicitudes de citas o reservas, con selección de servicio y los datos necesarios. Para confirmar horarios en tiempo real hace falta conectar una fuente de disponibilidad; sin ella, el asistente solo puede recibir una solicitud, no confirmar una cita."
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
    answer: "Usamos inteligencia artificial cuando aporta valor: por ejemplo, para apoyar procesos creativos, interpretar consultas o resumir información. Las reglas críticas, los cálculos y las validaciones deben quedar bajo control del software. Cada proyecto define qué tareas conviene delegar a IA y cuáles no."
  },
  {
    id: "price",
    phrases: ["cuanto cuesta", "cual es el precio", "cuanto cobran", "que precio tiene", "necesito una cotizacion"],
    terms: ["precio", "cotizacion", "presupuesto", "cobran", "costo"],
    answer: "No tenemos un precio universal. Cada proyecto se cotiza según alcance, integraciones, volumen de uso, producción necesaria, mantenimiento y costos de servicios externos. Cuéntanos qué necesitas y podemos preparar una evaluación antes de hablar de cifras."
  },
  {
    id: "timing",
    phrases: ["cuanto demora", "cuanto tarda", "cuando estaria listo", "cual es el plazo"],
    terms: ["demora", "tarda", "plazo", "tiempo"],
    answer: "El plazo depende del alcance y de las integraciones o producción necesarias. Primero definimos qué debe hacer la solución, qué recursos intervienen y cómo comprobaremos que funciona. No sería serio prometerte una fecha sin revisar eso."
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
    answer: "Puedes continuar por WhatsApp con el equipo de Automata. Antes de abrirlo, prepararemos un resumen editable de lo que nos contaste para que no tengas que empezar de cero."
  }
];

const quick = ["¿Qué hace Automata?", "¿Hacen publicidad con IA?", "Tengo un negocio de vinos", "Quiero automatizar pedidos por WhatsApp"];
const fallback = "No quiero darte una respuesta al azar. Puedo orientarte sobre tecnología, asistentes digitales, WhatsApp, sitios web, automatización, publicidad audiovisual con IA y campañas. Cuéntame qué tipo de negocio tienes y qué te gustaría conseguir.";

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
    return "¡Con gusto! Si quieres, cuéntame qué proceso o resultado te gustaría mejorar y te orientaré sobre el siguiente paso.";
  }

  if (/(vino|vinos|bodega|vinicola)/.test(normalized)) {
    return "¡Hay varias posibilidades para un negocio de vinos! Podemos explorar un catálogo digital para presentar etiquetas y características, consultas y solicitudes de pedidos por WhatsApp, contenido audiovisual y campañas para promocionar productos, o una web para fortalecer tu marca. La solución depende de cómo trabajas. ¿Vendes vinos propios, distribuyes distintas bodegas o tienes una tienda?";
  }

  if (/(mi negocio|mi empresa|tengo un negocio|para mi emprendimiento)/.test(normalized) && !/(publicidad|web|pagina|whatsapp|pedido|automatiz)/.test(normalized)) {
    return "Podemos ayudarte a mejorar la atención, ordenar consultas y pedidos, presentar tus productos o servicios en una web y desarrollar contenido publicitario. Para no ofrecerte algo que no necesitas, empecemos por lo básico: ¿a qué se dedica tu negocio y qué te gustaría mejorar primero?";
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

function buildHandoffSummary(messages: Message[]) {
  const userMessages = messages.filter((message) => message.role === "user").map((message) => message.text.trim()).filter(Boolean);
  const allText = normalize(userMessages.join(" "));
  const lines = [
    "Hola, equipo de Automata. Quiero continuar una consulta que inicié en su asistente web.",
    "",
    "RESUMEN DE LA CONVERSACIÓN",
    "Este resumen se preparó a partir de los mensajes que escribí en el asistente."
  ];

  const businessTypes = [
    { label: "Vinos / bodega", pattern: /\b(vino|vinos|bodega|vinicola)\b/ },
    { label: "Gastronomía / cafetería", pattern: /\b(cafeteria|cafe|restaurante|comida|gastronomia)\b/ },
    { label: "Salud / consultorio", pattern: /\b(consultorio|clinica|salud|paciente)\b/ },
    { label: "Belleza / peluquería", pattern: /\b(peluqueria|salon|belleza|estetica)\b/ },
    { label: "Comercio / tienda", pattern: /\b(tienda|comercio|distribuyo|distribuidor|vendo|ventas)\b/ }
  ];
  const business = businessTypes.find((item) => item.pattern.test(allText));
  if (business) lines.push("", "Rubro detectado por palabras mencionadas: " + business.label);

  const interests = [
    { label: "Publicidad audiovisual y campañas", pattern: /\b(publicidad|campana|campanas|anuncio|audiovisual|video)\b/ },
    { label: "Sitio web o catálogo", pattern: /\b(web|pagina|sitio|catalogo)\b/ },
    { label: "WhatsApp, consultas o pedidos", pattern: /\b(whatsapp|pedido|pedidos|consultas|clientes)\b/ },
    { label: "Asistente digital o chatbot", pattern: /\b(asistente|chatbot|chat|bot)\b/ },
    { label: "Automatización de procesos", pattern: /\b(automatizar|automatizacion|proceso|repetitiva|reportes)\b/ }
  ];
  const detected = interests.filter((item) => item.pattern.test(allText)).map((item) => item.label);
  if (detected.length) lines.push("", "Temas mencionados: " + detected.join("; "));

  lines.push("", "MENSAJES DEL CLIENTE");
  userMessages.slice(-8).forEach((message) => lines.push("• " + message));
  lines.push("", "Quisiera continuar la conversación y recibir orientación sobre el siguiente paso.");
  return lines.join("\n");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "¡Hola! Soy el asistente virtual de Automata. Puedo contarte qué hacemos y ayudarte a identificar oportunidades para tu negocio. ¿Qué necesitas resolver?" }]);
  const [handoffText, setHandoffText] = useState("");
  const [shareConsent, setShareConsent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("automata:open-chat", show);
    return () => window.removeEventListener("automata:open-chat", show);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, open, handoffText]);

  const send = (value = input) => {
    const text = value.trim();
    if (!text) return;
    const nextMessages: Message[] = [...messages, { role: "user", text }, { role: "bot", text: answerFor(text) }];
    setMessages(nextMessages);
    setHandoffText(buildHandoffSummary(nextMessages));
    setShareConsent(false);
    setInput("");
  };

  const submit = (event: FormEvent) => { event.preventDefault(); send(); };

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
          {messages.length === 1 && <div className="automata-chat-quick">{quick.map((question) => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}</div>}
          {messages.some((message) => message.role === "user") && <section className="automata-handoff">
            <div className="automata-handoff-heading"><strong>Continúa sin repetir tu historia</strong><span>Tu resumen para WhatsApp</span></div>
            <p className="automata-handoff-copy">Revisa y edita lo que compartiremos con el equipo de Automata. Solo se enviará si marcas tu autorización y pulsas el botón.</p>
            <textarea aria-label="Resumen editable para WhatsApp" value={handoffText} onChange={(event) => { setHandoffText(event.target.value); setShareConsent(false); }} rows={8} />
            <label className="automata-handoff-consent"><input type="checkbox" checked={shareConsent} onChange={(event) => setShareConsent(event.target.checked)} /> Autorizo compartir este resumen y los mensajes incluidos con el equipo de Automata por WhatsApp.</label>
            <button type="button" className="automata-handoff-button" onClick={continueOnWhatsApp} disabled={!shareConsent || !handoffText.trim()}><MessageCircle size={17} /> Continuar por WhatsApp <ArrowUpRight size={16} /></button>
          </section>}
          <div ref={bottomRef} />
        </div>
        <form className="automata-chat-compose" onSubmit={submit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe tu consulta..." aria-label="Escribe tu consulta" />
          <button type="submit" disabled={!input.trim()} aria-label="Enviar mensaje"><Send size={18} /></button>
        </form>
        <p className="automata-chat-note"><Sparkles size={12} /> Asistente orientativo. La transferencia a WhatsApp es voluntaria y editable.</p>
      </section>}
      <button type="button" className="automata-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar asistente" : "Abrir asistente"}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span>¿Hablamos?</span>}
      </button>
    </div>
  );
}

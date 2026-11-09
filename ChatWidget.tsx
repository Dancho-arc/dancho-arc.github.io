import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };

const knowledge = [
  { keys: ["que es automata", "que hacen", "a que se dedican", "quienes son", "que ofrece", "servicios"], answer: "Automata diseña y desarrolla soluciones digitales para que los negocios atiendan mejor y pierdan menos tiempo en tareas repetitivas. Trabajamos con asistentes digitales, flujos de pedidos y reservas, sitios web, integraciones y automatización de procesos. Primero entendemos el problema; después proponemos la solución adecuada." },
  { keys: ["whatsapp", "pedidos", "pedido", "menu", "catalogo"], answer: "Podemos diseñar un flujo para recibir consultas y pedidos por WhatsApp, organizar productos, cantidades y observaciones, y preparar un resumen claro para el negocio. La aceptación del pedido siempre depende del negocio. Nuestro producto de pedidos está en etapa de validación, así que primero evaluamos el proceso y el alcance." },
  { keys: ["pagina web", "sitio web", "web", "landing", "pagina"], answer: "Sí. Diseñamos sitios web para presentar tu negocio, explicar tus servicios, captar consultas y conectar canales como WhatsApp. El alcance depende de lo que necesites: una web institucional no es lo mismo que una plataforma con usuarios, pagos o panel administrativo." },
  { keys: ["asistente", "chatbot", "bot", "responder", "preguntas frecuentes"], answer: "Podemos desarrollar asistentes digitales para responder consultas con información aprobada, orientar a clientes y derivar casos a una persona. Si necesita consultar sistemas, disponibilidad o datos privados, primero evaluamos las integraciones y las medidas de seguridad." },
  { keys: ["reserva", "reservas", "cita", "agenda", "turno"], answer: "Podemos diseñar un flujo de solicitudes de citas o reservas, con selección de servicio y datos necesarios. Para confirmar horarios en tiempo real hace falta una fuente de disponibilidad conectada; sin ella, el asistente solo puede recibir una solicitud, no confirmar una cita." },
  { keys: ["automatizacion", "automatizar", "proceso", "reportes", "registro"], answer: "Automatizamos tareas repetitivas como clasificar consultas, ordenar registros, generar reportes y enviar avisos. Para recomendar algo concreto necesitamos conocer el proceso actual, las herramientas que usa tu equipo y qué resultado esperas." },
  { keys: ["inteligencia artificial", "ia", "gemini", "modelo"], answer: "Usamos IA cuando aporta valor: por ejemplo, para interpretar mensajes, clasificar consultas o resumir información. Las reglas críticas, los cálculos y las validaciones deben quedar bajo control del software, no de una respuesta improvisada del modelo." },
  { keys: ["precio", "cuanto cuesta", "cotizacion", "presupuesto", "cobran"], answer: "No tenemos un precio universal. Cada proyecto se cotiza según alcance, integraciones, volumen de uso, mantenimiento y costos de servicios externos. Cuéntanos qué necesitas y podemos preparar una evaluación antes de hablar de cifras." },
  { keys: ["cuanto demora", "tiempo", "plazo", "cuando estaria"], answer: "El plazo depende del alcance y de las integraciones necesarias. Primero definimos qué debe hacer la solución, qué sistemas intervienen y cómo se comprobará que funciona. No sería serio prometerte una fecha sin revisar eso." },
  { keys: ["salud", "consultorio", "clinica", "paciente"], answer: "Podemos evaluar herramientas administrativas para consultorios, como solicitudes de cita e información general. No diseñamos asistentes para diagnosticar ni sustituir al personal sanitario, y los datos de salud requieren controles especiales." },
  { keys: ["hablar con alguien", "persona", "humano", "contacto"], answer: "Claro. Puedes continuar por WhatsApp y contarle tu caso al equipo de Automata. El botón de contacto abrirá una conversación con un mensaje preparado para que lo revises antes de enviarlo." },
];

const quick = ["¿Qué hace Automata?", "Quiero automatizar pedidos por WhatsApp", "Necesito una página web", "¿Cuánto cuesta?"];

function answerFor(input: string) {
  const normalized = input.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,]/g, "");
  const ranked = knowledge.map((item) => ({
    item,
    score: item.keys.reduce((score, key) => score + (normalized.includes(key.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  if (ranked[0]?.score > 0) return ranked[0].item.answer;
  return "Puedo orientarte sobre asistentes digitales, WhatsApp, pedidos, reservas, sitios web e IA. Para una necesidad más específica, cuéntame qué quieres lograr y te diré si encaja con lo que desarrollamos o si necesita una evaluación técnica. No voy a inventarte una respuesta ni prometerte algo sin revisar el caso.";
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

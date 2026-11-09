import React, { useState } from "react";
import ChatWidget from "./ChatWidget";
import { ArrowDown, ArrowRight, Bot, CalendarCheck, Check, ChevronDown, Clock, Coffee, CupSoda, CakeSlice, Menu, MessageCircle, Minus, Plus, Sandwich, Scissors, Sparkles, Globe, Workflow, Brain, ShoppingBag, X } from "lucide-react";
import logoFull from "./assets/42a5f50319bf92a6-automataF.png";
import iconOnly from "./assets/d3d0ef7bd1bb0246-automata.png";

const pain = [
  { n: "01", icon: MessageCircle, title: "Respondes lo mismo 20 veces al día", after: "Lo responde Autómata.", color: "#FFF1E8" },
  { n: "02", icon: ShoppingBag, title: "Pedidos por WhatsApp desordenados", after: "Pedidos ordenados.", color: "#F2F0FF" },
  { n: "03", icon: CalendarCheck, title: "Citas por mensaje", after: "Reservas solas.", color: "#E8FFF3" },
];

const solutions = [
  { icon: Bot, title: "Asistentes que responden", line: "Respuestas claras en web y WhatsApp.", example: "Ejemplo: tu cafetería responde menú, horario y ubicación sin esperar.", color: "#FF5A00", bg: "#FFF1E8" },
  { icon: ShoppingBag, title: "Pedidos y reservas", line: "Pedidos, citas y reservas sin caos.", example: "Ejemplo: el cliente pide, reserva y recibe confirmación en orden.", color: "#6C3BFF", bg: "#F2F0FF" },
  { icon: Globe, title: "Sitios web vivos", line: "Webs que venden, no solo se ven.", example: "Ejemplo: catálogo siempre actualizado, sin mensajes sueltos.", color: "#007AFF", bg: "#EAF4FF" },
  { icon: Workflow, title: "Procesos automáticos", line: "Lo repetitivo, en piloto automático.", example: "Ejemplo: registros, reportes y avisos se hacen solos.", color: "#00A86B", bg: "#E8FFF3" },
  { icon: Brain, title: "IA bien aplicada", line: "IA donde suma, con reglas claras.", example: "Ejemplo: clasifica consultas y resume información para tu equipo.", color: "#E11D63", bg: "#FFEAF1" },
];

const dishes = [
  { id: "d1", name: "Café de especialidad", desc: "Filtrado · Tueste local", price: 18, icon: Coffee, grad: "linear-gradient(135deg,#FF8A00,#FF5A00)" },
  { id: "d2", name: "Sándwich del día", desc: "Pan artesanal · Fresco", price: 32, icon: Sandwich, grad: "linear-gradient(135deg,#6C3BFF,#B07CFF)" },
  { id: "d3", name: "Torta de la casa", desc: "Porción del día", price: 22, icon: CakeSlice, grad: "linear-gradient(135deg,#E11D63,#FF6B9D)" },
  { id: "d4", name: "Jugo natural", desc: "Fruta de temporada", price: 20, icon: CupSoda, grad: "linear-gradient(135deg,#00A86B,#7ED957)" },
];
const clinicServices = ["Consulta general", "Control y seguimiento", "Orientación inicial", "Revisión de estudios"];
const salonServices = [
  { name: "Corte y estilo", price: 80 },
  { name: "Color y tratamiento", price: 180 },
  { name: "Peinado para ocasión", price: 120 },
  { name: "Manicura", price: 60 },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSolution, setOpenSolution] = useState<number | null>(0);
  const [demo, setDemo] = useState<"restaurante" | "consultorio" | "peluqueria">("restaurante");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderDone, setOrderDone] = useState(false);
  const [clinicService, setClinicService] = useState(clinicServices[0]);
  const [clinicName, setClinicName] = useState("");
  const [clinicDate, setClinicDate] = useState("");
  const [clinicDone, setClinicDone] = useState<string | null>(null);
  const [salonService, setSalonService] = useState(salonServices[0].name);
  const [salonTime, setSalonTime] = useState("10:00");
  const [salonName, setSalonName] = useState("");
  const [salonDone, setSalonDone] = useState<string | null>(null);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = dishes.reduce((s, it) => s + (cart[it.id] || 0) * it.price, 0);
  const add = (id: string) => { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); setOrderDone(false); };
  const remove = (id: string) => setCart((c) => { const n = { ...c }; n[id] = Math.max(0, (n[id] || 0) - 1); if (n[id] === 0) delete n[id]; return n; });

  const openAssistant = () => window.dispatchEvent(new Event("automata:open-chat"));

  const nav = [
    { label: "Soluciones", href: "#soluciones" },
    { label: "Demos", href: "#demos" },
    { label: "Proceso", href: "#proceso" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "#fff" }} className="overflow-x-clip text-[#0E1116]">
      {/* NAV */}
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-50 border-b border-[#E8E6E1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1220px] items-center justify-between gap-3 px-5 sm:px-8">
          <a href="#inicio" className="flex items-center" aria-label="Automata — Inicio"><img src={logoFull} alt="Automata" className="h-[36px] w-auto object-contain sm:h-[42px]" /></a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">{nav.map((n) => <a key={n.href} href={n.href} className="text-[14px] font-semibold text-[#5A6068] hover:text-[#0E1116]">{n.label}</a>)}</nav>
          <div className="flex items-center gap-3">
            <button type="button" onClick={openAssistant} className="hidden min-h-[48px] items-center gap-2 rounded-full bg-[#FF5A00] px-5 text-[14px] font-bold text-white transition hover:bg-[#E14E00] sm:flex">Hablar con Autómata <Bot size={17} /></button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-[#E8E6E1] lg:hidden" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-[#E8E6E1] bg-white px-5 py-4 lg:hidden"><nav className="flex flex-col" aria-label="Navegación móvil">{nav.map((n) => <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="flex min-h-[48px] items-center border-b border-[#E8E6E1] text-[15px] font-semibold last:border-0">{n.label}</a>)}<button type="button" onClick={() => { setMenuOpen(false); openAssistant(); }} className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 text-[14px] font-bold text-white">Hablar con Autómata <Bot size={17} /></button></nav></div>}
      </header>

      <main>
        {/* HERO */}
        <section id="inicio" className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-[1220px] items-center gap-8 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:pb-14 lg:pt-14">
            <div>
              <p className="reveal flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]"><span className="h-[8px] w-[8px] rounded-full bg-[#FF5A00]" />Tarija • Bolivia</p>
              <h1 className="reveal-2 display mt-5 text-[44px] sm:text-[72px] lg:text-[92px]">Tu negocio no necesita más tecnología.<br /><span className="text-[#FF5A00]">Necesita que funcione.</span></h1>
              <p className="reveal-3 mt-6 text-[18px] font-medium leading-snug text-[#5A6068] sm:text-[20px]">Automatizamos lo repetitivo para que atiendas mejor.</p>
              <div className="reveal-3 mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#demos" className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full bg-[#0E1116] px-7 text-[15px] font-bold text-white sm:flex-none">Ver demos en vivo <ArrowDown size={18} /></a>
                <button type="button" onClick={openAssistant} className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#0E1116] px-7 text-[15px] font-bold sm:flex-none">Hablar con Autómata <Bot size={18} /></button>
              </div>
            </div>
            <div className="mx-auto flex w-full max-w-[420px] flex-col items-center text-center">
              <div className="floaty self-start rounded-2xl border border-[#E8E6E1] bg-white px-4 py-3 shadow-xl"><p className="text-left text-[14px] font-bold">Hola, soy Autómata 👋</p><p className="text-left text-[12px] text-[#5A6068]">¿Qué automatizamos hoy?</p></div>
              <div className="breathe relative mt-2">
                <div className="absolute inset-x-8 bottom-2 h-[28px] rounded-full bg-[#FF5A00]/15 blur-xl" aria-hidden="true" />
                <button type="button" onClick={() => window.dispatchEvent(new Event("automata:open-chat"))} aria-label="Abrir el asistente de Automata" className="relative z-10 rounded-[32px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A00]"><img src={iconOnly} alt="Autómata, asistente virtual de Automata" className="mx-auto h-[300px] w-auto object-contain sm:h-[380px] lg:h-[400px]" /></button>
              </div>
              <div className="mt-2 self-end rounded-full bg-[#0E1116] px-4 py-2 text-[12px] font-bold text-white">Asistente virtual · Haz clic para conversar</div>
            </div>
          </div>
          <div className="overflow-hidden border-y-2 border-[#0E1116] bg-[#FF5A00] py-3 text-white">
            <div className="marquee-track flex w-max whitespace-nowrap"><span className="display text-[22px] uppercase">Asistentes • Pedidos • Reservas • Webs • Automatización • IA •&nbsp;</span><span className="display text-[22px] uppercase">Asistentes • Pedidos • Reservas • Webs • Automatización • IA •&nbsp;</span></div>
          </div>
        </section>

        {/* MIRA LO QUE PASA */}
        <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-24">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Mira lo que pasa</p>
          <h2 className="display mt-4 max-w-[820px] text-[44px] sm:text-[64px]">Tu día, sin fricción.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pain.map((p) => <article key={p.n} className="card-lift rounded-[28px] border border-[#E8E6E1] p-6 sm:p-7" style={{ background: p.color }}><div className="flex items-start justify-between"><p.icon size={34} className="text-[#0E1116]" /><span className="display text-[56px] text-[#0E1116]/15">{p.n}</span></div><h3 className="mt-10 text-[24px] font-extrabold leading-tight">{p.title}</h3><p className="mt-3 inline-block rounded-full bg-[#0E1116] px-4 py-2 text-[14px] font-bold text-white">{p.after}</p></article>)}
          </div>
        </section>

        {/* SOLUCIONES */}
        <section id="soluciones" className="bg-[#0E1116] py-16 text-white sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1220px] px-5 sm:px-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Soluciones</p>
            <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="display mt-4 text-[44px] sm:text-[64px]">Cinco formas<br />de avanzar.</h2><p className="max-w-[260px] text-[15px] leading-snug text-white/60">Toca una tarjeta. Ve el ejemplo. Sin texto largo.</p></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {solutions.map((s, i) => { const open = openSolution === i; return (
                <article key={s.title} className={`card-lift overflow-hidden rounded-[28px] p-6 text-[#0E1116] sm:p-7 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`} style={{ background: s.bg }}>
                  <button onClick={() => setOpenSolution(open ? null : i)} aria-expanded={open} className="w-full text-left"><div className="flex items-start justify-between"><span className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl text-white" style={{ background: s.color }}><s.icon size={28} /></span><ChevronDown size={22} className={`transition-transform ${open ? "rotate-180" : ""}`} /></div><h3 className="display mt-8 text-[30px] leading-[0.95]">{s.title}</h3><p className="mt-3 text-[15px] font-medium text-[#5A6068]">{s.line}</p></button>
                  {open && <p className="pop mt-5 rounded-2xl bg-white p-4 text-[14px] font-semibold leading-snug">{s.example}</p>}
                </article>); })}
              <div className="flex flex-col justify-between rounded-[28px] bg-[#FF5A00] p-6 text-white sm:p-7"><h3 className="display text-[32px] leading-[0.95]">¿Cuál es tu cuello de botella?</h3><button type="button" onClick={openAssistant} className="mt-8 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#0E1116]">Cuéntanos <ArrowRight size={17} /></button></div>
            </div>
          </div>
        </section>

        {/* DEMOS */}
        <section id="demos" className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-24">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Demos en vivo</p>
          <h2 className="display mt-4 text-[48px] sm:text-[72px] lg:text-[88px]">No lo leas.<br /><span className="text-[#FF5A00]">Pruébalo.</span></h2>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row" role="tablist" aria-label="Demostraciones">
            {([{ id: "restaurante", label: "RESTAURANTE", dot: "#FF5A00" }, { id: "consultorio", label: "CONSULTORIO", dot: "#007AFF" }, { id: "peluqueria", label: "PELUQUERÍA", dot: "#E11D63" }] as const).map((t) => <button key={t.id} role="tab" aria-selected={demo === t.id} onClick={() => setDemo(t.id)} className={`min-h-[56px] flex-1 rounded-full border-2 px-5 text-[14px] font-extrabold transition ${demo === t.id ? "border-[#0E1116] bg-[#0E1116] text-white" : "border-[#E8E6E1] bg-white text-[#5A6068]"}`}><span className="mr-2 inline-block h-[10px] w-[10px] rounded-full" style={{ background: t.dot }} />{t.label}</button>)}
          </div>

          <div className="mt-6 overflow-hidden rounded-[32px] border border-[#E8E6E1] bg-[#F4F3F0]">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0E1116] px-5 py-3 text-white sm:px-7"><p className="text-[12px] font-extrabold uppercase tracking-[0.16em]"><span className="text-[#FF5A00]">●</span> Demo simulada</p><p className="text-[13px] text-white/70">{demo === "restaurante" ? "Café · Menú y pedidos" : demo === "consultorio" ? "Servicios · Solicitud de cita" : "Servicios · Solicitud de reserva"}</p></div>

            {demo === "restaurante" && (
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_.65fr]">
                <div><h3 className="display text-[30px]">Café Autómata</h3><p className="mt-1 text-[14px] text-[#5A6068]">Elige. Suma. Registra. Así de simple.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">{dishes.map((d) => <div key={d.id} className="card-lift overflow-hidden rounded-[24px] bg-white"><div className="flex h-[132px] items-center justify-center text-white" style={{ background: d.grad }}><d.icon size={58} strokeWidth={1.4} /></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-extrabold leading-tight">{d.name}</p><p className="mt-1 text-[13px] text-[#5A6068]">{d.desc}</p></div><p className="font-extrabold">Bs {d.price}</p></div><button onClick={() => add(d.id)} className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-1 rounded-full bg-[#0E1116] text-[14px] font-bold text-white"><Plus size={17} /> Añadir</button></div></div>)}</div>
                </div>
                <aside className="h-fit rounded-[24px] bg-white p-5"><p className="flex items-center justify-between font-extrabold">Tu pedido <span className="rounded-full bg-[#FFF1E8] px-3 py-1 text-[12px] text-[#FF5A00]">{cartCount} artículos</span></p>
                  {cartCount === 0 ? <p className="mt-4 text-[14px] leading-relaxed text-[#5A6068]">Tu carrito está vacío. Añade algo rico.</p> : <div className="mt-4 space-y-3">{dishes.filter((d) => cart[d.id]).map((d) => <div key={d.id} className="flex items-center justify-between gap-2 text-[14px]"><span className="font-semibold">{d.name}</span><span className="flex items-center gap-2"><button onClick={() => remove(d.id)} aria-label={`Quitar ${d.name}`} className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E8E6E1]"><Minus size={14} /></button>{cart[d.id]} · Bs {cart[d.id] * d.price}</span></div>)}</div>}
                  <div className="mt-5 flex justify-between border-t border-[#E8E6E1] pt-4 text-[18px] font-extrabold"><span>Total</span><span>Bs {cartTotal}</span></div>
                  <button onClick={() => { if (cartCount) { setOrderDone(true); setCart({}); } }} disabled={cartCount === 0} className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#FF5A00] text-[14px] font-bold text-white disabled:opacity-40">Registrar pedido</button>
                  {orderDone && <div className="pop mt-4 rounded-2xl bg-[#E8FFF3] p-4"><p className="flex gap-2 text-[14px] font-bold"><Check size={18} className="shrink-0 text-[#00A86B]" />Pedido registrado. Simulación lista.</p><p className="mt-1 text-[13px] text-[#5A6068]">En la versión real, tu negocio lo confirmaría.</p></div>}
                </aside>
              </div>
            )}

            {demo === "consultorio" && (
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
                <div><h3 className="display text-[30px]">Agenda tu cita</h3><p className="mt-1 text-[14px] text-[#5A6068]">Tres pasos. Sin llamadas perdidas.</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">{clinicServices.map((s) => <button key={s} onClick={() => setClinicService(s)} aria-pressed={clinicService === s} className={`min-h-[56px] rounded-2xl border-2 px-3 text-left text-[13px] font-bold ${clinicService === s ? "border-[#007AFF] bg-[#EAF4FF]" : "border-[#E8E6E1] bg-white"}`}>{s}</button>)}</div>
                  <div className="mt-4 space-y-3"><div><label htmlFor="clinic-name">Nombre</label><input id="clinic-name" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Nombre completo" autoComplete="name" /></div><div><label htmlFor="clinic-date">Fecha tentativa</label><input id="clinic-date" type="date" value={clinicDate} onChange={(e) => setClinicDate(e.target.value)} /></div></div>
                  <button onClick={() => { if (clinicName.trim() && clinicDate) setClinicDone(`${clinicName.trim()} · ${clinicService} · ${clinicDate}`); }} disabled={!clinicName.trim() || !clinicDate} className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#007AFF] text-[14px] font-bold text-white disabled:opacity-40">Solicitar cita</button>
                </div>
                <div className="rounded-[24px] bg-white p-5"><p className="font-extrabold">Tu solicitud</p>{clinicDone ? <div className="pop mt-4 rounded-2xl bg-[#EAF4FF] p-5"><span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#007AFF] text-white"><CalendarCheck size={24} /></span><p className="mt-3 text-[16px] font-extrabold leading-snug">{clinicDone}</p><p className="mt-2 text-[13px] leading-relaxed text-[#5A6068]">Solicitud registrada. Simulación: la confirmación real la da la atención humana.</p></div> : <p className="mt-4 text-[14px] leading-relaxed text-[#5A6068]">Completa el formulario y tu resumen aparece aquí.</p>}</div>
              </div>
            )}

            {demo === "peluqueria" && (
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_.8fr]">
                <div><h3 className="display text-[30px]">Reserva tu momento</h3><p className="mt-1 text-[14px] text-[#5A6068]">Servicio, hora y listo.</p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">{salonServices.map((s) => <button key={s.name} onClick={() => setSalonService(s.name)} aria-pressed={salonService === s.name} className={`min-h-[72px] rounded-2xl border-2 p-4 text-left ${salonService === s.name ? "border-[#E11D63] bg-[#FFEAF1]" : "border-[#E8E6E1] bg-white"}`}><span className="block font-extrabold">{s.name}</span><span className="mt-1 block text-[14px] text-[#5A6068]">Bs {s.price}</span></button>)}</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label htmlFor="salon-name">Nombre</label><input id="salon-name" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Nombre completo" /></div><div><label htmlFor="salon-time">Hora tentativa</label><select id="salon-time" value={salonTime} onChange={(e) => setSalonTime(e.target.value)}>{["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((h) => <option key={h}>{h}</option>)}</select></div></div>
                  <button onClick={() => { if (salonName.trim()) setSalonDone(`${salonName.trim()} · ${salonService} · ${salonTime}`); }} disabled={!salonName.trim()} className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#E11D63] text-[14px] font-bold text-white disabled:opacity-40">Reservar</button>
                </div>
                <div className="h-fit rounded-[24px] bg-white p-5"><p className="flex items-center gap-2 font-extrabold"><Scissors size={18} /> Tu reserva</p>{salonDone ? <div className="pop mt-4 rounded-2xl bg-[#FFEAF1] p-5"><p className="text-[16px] font-extrabold leading-snug">{salonDone}</p><p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-[#5A6068]"><Clock size={15} className="mt-[1px] shrink-0" />Solicitud registrada. Simulación: la disponibilidad se confirma en la versión real.</p></div> : <p className="mt-4 text-[14px] leading-relaxed text-[#5A6068]">Elige un servicio y tu nombre para ver el resumen.</p>}</div>
              </div>
            )}
          </div>
          <p className="mt-4 text-[13px] text-[#5A6068]">Datos ficticios. Ninguna acción aquí crea un pedido, una cita ni una reserva reales.</p>
        </section>

        {/* PROCESO */}
        <section id="proceso" className="border-y border-[#E8E6E1] bg-[#F4F3F0] py-16 lg:py-20">
          <div className="mx-auto max-w-[1220px] px-5 sm:px-8"><p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Cómo trabajamos</p><h2 className="display mt-4 text-[44px] sm:text-[56px]">Simple. De verdad.</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">{[["01", "Comprender", "Escuchamos tu negocio real"], ["02", "Diseñar", "Solución a tu medida"], ["03", "Demostrar", "Ves la solución funcionando"], ["04", "Implementar", "Construimos y configuramos todo"], ["05", "Acompañar", "Mejoras y soporte continuo"]].map(([n, t, d]) => <div key={t} className="relative text-center lg:text-left"><span className="relative z-10 mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#0E1116] text-[16px] font-extrabold text-white lg:mx-0">{n}</span><h3 className="mt-4 text-[19px] font-extrabold">{t}</h3><p className="mt-1 text-[14px] leading-snug text-[#5A6068]">{d}</p></div>)}</div>
          </div>
        </section>

        {/* MODELO */}
        <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Modelo</p><h2 className="display mt-4 text-[44px] sm:text-[56px]">Costos claros.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[["Implementación", "Diseño, desarrollo y puesta en marcha.", "#FFF1E8"], ["Recurrente", "Soporte, mejoras y acompañamiento.", "#F2F0FF"], ["Consumo", "APIs, IA y mensajería según uso.", "#E8FFF3"]].map(([t, d, bg]) => <div key={t} className="card-lift rounded-[28px] p-6 sm:p-7" style={{ background: bg }}><p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#5A6068]">{t}</p><h3 className="display mt-4 text-[32px]">{t}</h3><p className="mt-3 text-[15px] font-medium leading-snug text-[#5A6068]">{d}</p></div>)}
          </div>
          <p className="mt-6 text-[14px] text-[#5A6068]">Sin precio universal. Cada proyecto se cotiza según alcance.</p>
        </section>

        {/* CIERRE */}
        <section id="contacto" className="bg-[#0E1116] py-16 text-white sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1220px] px-5 text-center sm:px-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Primer contacto</p>
            <h2 className="display mx-auto mt-5 max-w-[900px] text-[44px] sm:text-[72px] lg:text-[88px]">Cuéntale a Autómata qué necesita tu negocio.</h2>
            <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-white/65">Empieza por aquí. Nuestro asistente te ayudará a entender opciones, identificar oportunidades y preparar el contexto antes de pasar a una conversación por WhatsApp.</p>
            <button type="button" onClick={openAssistant} className="mx-auto mt-9 flex min-h-[64px] w-full max-w-[480px] items-center justify-center gap-3 rounded-full bg-[#FF5A00] px-7 text-[17px] font-extrabold text-white transition hover:bg-[#E14E00] sm:w-auto">Hablar con Autómata <Bot size={21} /></button>
            <p className="mt-4 text-[13px] text-white/50">WhatsApp estará disponible desde el asistente, con el resumen de tu consulta y tu autorización.</p>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-[1220px] flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4"><span className="display text-[22px] text-[#0E1116]">AUTOMATA<span className="text-[#FF5A00]">.</span></span><p className="max-w-[320px] text-[13px] leading-snug text-[#5A6068]">Tecnología que trabaja para simplificar el negocio.</p></div>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-[#5A6068]"><Sparkles size={15} className="text-[#FF5A00]" />No presentamos demos como clientes reales.</p>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

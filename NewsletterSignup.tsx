import React, { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

const API = "https://automata-chat.dgckg-trd1.workers.dev";
const CONSENT_VERSION = "2026-11-09-v1";

export default function NewsletterSignup() {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, busy]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!consent || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(API + "/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, contact: contact.trim(), consent: true, consentVersion: CONSENT_VERSION }),
      });
      const payload = await response.json().catch(() => ({})) as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "No pudimos registrar tu suscripción.");
      setStatus({ ok: true, text: payload.message || "Tu suscripción quedó registrada." });
      setContact("");
      setConsent(false);
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "No pudimos registrar tu suscripción." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#E8E6E1] bg-white px-5 text-[13px] font-extrabold text-[#0E1116] transition hover:border-[#FF5A00] hover:text-[#FF5A00]">
        Recibir novedades <ArrowRight size={16} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-[#0E1116]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="newsletter-title" className="pop relative my-auto w-full max-w-[520px] rounded-[28px] border border-[#E8E6E1] bg-[#F4F3F0] p-5 shadow-[0_28px_90px_rgba(0,0,0,.3)] sm:p-8">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="Cerrar registro de novedades" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E6E1] bg-white text-[#5A6068] transition hover:text-[#FF5A00] disabled:opacity-40">
              <X size={18} />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">Sigamos en contacto</p>
            <h2 id="newsletter-title" className="display mt-3 max-w-[390px] pr-8 text-[34px] sm:text-[42px]">Las próximas ideas llegan por aquí.</h2>
            <p className="mt-4 max-w-[430px] text-[14px] leading-relaxed text-[#5A6068]">Recibe novedades, lanzamientos y promociones de Automata. Tú eliges el canal. Sin mensajes automáticos por el simple hecho de visitar la web.</p>
            <form onSubmit={submit} className="mt-6 rounded-[22px] border border-[#E8E6E1] bg-white p-5 sm:p-6">
              <label htmlFor="newsletter-channel" className="block text-xs font-bold text-[#5A6068]">¿Dónde prefieres recibir novedades?</label>
              <select id="newsletter-channel" value={channel} onChange={(event) => { setChannel(event.target.value as "whatsapp" | "email"); setStatus(null); }} className="mt-2">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Correo electrónico</option>
              </select>
              <label htmlFor="newsletter-contact" className="mt-4 block text-xs font-bold text-[#5A6068]">{channel === "whatsapp" ? "Tu número de WhatsApp" : "Tu correo electrónico"}</label>
              <input id="newsletter-contact" type={channel === "whatsapp" ? "tel" : "email"} autoComplete={channel === "whatsapp" ? "tel" : "email"} inputMode={channel === "whatsapp" ? "tel" : "email"} placeholder={channel === "whatsapp" ? "+591 70000000" : "tu@correo.com"} value={contact} onChange={(event) => { setContact(event.target.value); setStatus(null); }} maxLength={160} required className="mt-2" />
              <label className="mt-4 flex items-start gap-3 text-xs font-medium leading-relaxed text-[#5A6068]">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF5A00]" />
                <span>Acepto recibir novedades, lanzamientos y promociones de Automata por {channel === "whatsapp" ? "WhatsApp" : "correo electrónico"}. Puedo solicitar la baja cuando quiera.</span>
              </label>
              <button type="submit" disabled={!consent || !contact.trim() || busy} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Registrando..." : "Quiero recibir novedades"} <ArrowRight size={17} /></button>
              {status && <p role="status" className={"mt-4 flex items-start gap-2 text-xs leading-relaxed " + (status.ok ? "text-green-700" : "text-red-700")}>{status.ok && <CheckCircle2 size={16} className="shrink-0" />}{status.text}</p>}
              <p className="mt-4 text-[10px] leading-relaxed text-[#8A8F96]">Solo guardamos el canal y contacto que compartes, junto con la fecha y el texto de tu autorización. No vendemos tu contacto. Puedes solicitar la baja escribiéndonos por <a className="font-bold underline" href="https://wa.me/59176192899?text=Solicito%20darme%20de%20baja%20de%20las%20novedades%20de%20Automata" target="_blank" rel="noreferrer">WhatsApp</a>.</p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

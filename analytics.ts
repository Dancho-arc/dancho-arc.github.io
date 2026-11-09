const API = "https://automata-chat.dgckg-trd1.workers.dev";
const sessionId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "session-" + Date.now();

function hasAnalyticsConsent() {
  return typeof document !== "undefined" && document.cookie.split("; ").some((item) => item === "automata_analytics_consent=accepted");
}

export function setAnalyticsConsent(accepted: boolean) {
  document.cookie = "automata_analytics_consent=" + (accepted ? "accepted" : "rejected") + "; Max-Age=15552000; Path=/; SameSite=Lax; Secure";
}

export function trackEvent(event: "page_view" | "chat_open" | "chat_message" | "whatsapp_click", category?: string) {
  if (!hasAnalyticsConsent()) return;
  void fetch(API + "/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Analytics-Consent": "yes" },
    body: JSON.stringify({ sessionId, event, category, page: window.location.pathname }),
    keepalive: true,
  }).catch(() => undefined);
}

export function analyticsConsentChoice(): "accepted" | "rejected" | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie.split("; ").find((item) => item.startsWith("automata_analytics_consent="))?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

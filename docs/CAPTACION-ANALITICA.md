# Captación y analítica de Automata

## Componentes

- Sitio: GitHub Pages, `https://automata-bo.github.io`.
- API: Worker `automata-chat`, `https://automata-chat.dgckg-trd1.workers.dev`.
- Persistencia: D1 `automata-audience`, binding `DB`.

## Analítica opcional

La cookie `automata_analytics_consent` recuerda si el visitante aceptó o rechazó analítica. Si acepta, el navegador envía eventos permitidos a `POST /api/events`:

- `page_view`
- `chat_open`
- `chat_message`
- `whatsapp_click`

Se guarda un identificador aleatorio temporal de sesión, el evento, una categoría general y la ruta. No se guardan textos de conversación, nombres, correos, teléfonos ni direcciones IP en `analytics_events`. Sin consentimiento analítico no se envían eventos.

## Suscripciones

El formulario permite elegir WhatsApp o correo y requiere una casilla de consentimiento explícita, desmarcada por defecto. `POST /api/subscribe` valida el canal y el dato, y guarda:

- Canal y contacto.
- Texto y versión del consentimiento.
- Fecha de registro.
- Estado (`active` o `unsubscribed`).
- Token opaco de baja para futuras campañas.

El formulario informa que se puede solicitar la baja escribiendo al WhatsApp de Automata: +591 76192899. La ruta `POST /api/unsubscribe` admite el token opaco cuando se incorpore a los mensajes de campaña.

**Importante:** la web registra suscripciones, pero todavía no envía campañas automáticas ni correos. Los envíos deben incorporarse después con el proveedor y el proceso de bajas correspondiente. No interpretar el consentimiento de transferencia a WhatsApp del chat como consentimiento de marketing.

## Consultas en Cloudflare D1 Console

Suscriptores activos:

```sql
SELECT channel, contact, status, consent_text, consent_version, created_at
FROM subscribers
WHERE status = 'active'
ORDER BY created_at DESC;
```

Resumen de actividad:

```sql
SELECT event_name, category, COUNT(*) AS total
FROM analytics_events
GROUP BY event_name, category
ORDER BY total DESC;
```

Sesiones anónimas registradas:

```sql
SELECT COUNT(DISTINCT session_id) AS sessions
FROM analytics_events;
```

## Límites actuales

- La sesión analítica dura solo la vida de la pestaña; no identifica a una persona ni la sigue entre dispositivos.
- Los eventos anteriores al despliegue no se pueden recuperar retroactivamente.
- No hay panel administrativo público. Los registros se consultan desde Cloudflare D1 Console.
- No se debe importar conversaciones antiguas ni datos personales sin una base legítima y el consentimiento correspondiente.

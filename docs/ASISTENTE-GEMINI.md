# Asistente comercial de Automata con Gemini

## Arquitectura

- **Frontend:** React + Vite en GitHub Pages.
- **Backend:** Cloudflare Worker en `worker/`.
- **Modelo:** Gemini Flash mediante la API REST oficial.
- **Secreto:** `GEMINI_API_KEY` únicamente en Cloudflare Worker Secrets.
- **Transferencia:** el navegador prepara un resumen editable y abre WhatsApp solo después de autorización explícita. Gemini no controla esa acción.

## Preparación del backend

Requisitos: Node.js 22 o superior, cuenta Cloudflare y una clave de Gemini API creada en Google AI Studio.

1. Entra a `worker/`.
2. Ejecuta `npm install`.
3. Inicia sesión: `npx wrangler login`.
4. Guarda la clave directamente en Cloudflare:

   ```bash
   npx wrangler secret put GEMINI_API_KEY --config wrangler.jsonc
   ```

   Pega la clave en la terminal local cuando Wrangler la solicite. No la incluyas en Git, GitHub Actions, el frontend ni conversaciones.

5. Comprueba tipos y despliega:

   ```bash
   npm run typecheck
   npm run deploy
   ```

6. Wrangler mostrará una URL similar a `https://automata-chat.<tu-subdominio>.workers.dev`.
7. Comprueba `https://automata-chat.<tu-subdominio>.workers.dev/health`. Debe responder `{"status":"ok","service":"automata-chat"}`.

El Worker acepta únicamente el origen configurado en `ALLOWED_ORIGIN`. La configuración inicial autoriza `https://automata-bo.github.io`.

## Conectar GitHub Pages

En el repositorio `automata-bo/automata-bo.github.io`, abre:

**Settings → Secrets and variables → Actions → Variables → New repository variable**

Crea:

- Nombre: `VITE_AUTOMATA_API_URL`
- Valor: la URL raíz del Worker, sin barra final. Ejemplo: `https://automata-chat.<tu-subdominio>.workers.dev`

La variable es una URL pública, no un secreto. El secreto de Gemini permanece en Cloudflare.

El workflow de Pages lee esa variable al compilar. Si está vacía, la web mantiene el modo local de demostración y lo identifica como tal; no simula que Gemini está conectado.

## Controles incluidos

- CORS limitado al dominio de Automata.
- Clave Gemini solo en el backend.
- Límite de 20 mensajes, 1.800 caracteres por mensaje y 12.000 caracteres por conversación.
- Rate limiting aproximado por sesión y por IP.
- Timeout de 25 segundos.
- Respuestas de error genéricas: no se exponen detalles del proveedor.
- No se persiste el historial en el Worker ni se registran mensajes de clientes.
- Gemini no puede ejecutar acciones, enviar mensajes ni abrir WhatsApp.
- Catálogo comercial y límites de promesas incluidos en la instrucción de sistema.

Los límites de Cloudflare son aproximados y se aplican por ubicación. No equivalen a un control antifraude estricto ni sustituyen la supervisión de consumo de Gemini. CORS tampoco es autenticación: un cliente automatizado puede falsificar el encabezado Origin. Antes de promocionar el asistente para recibir tráfico público amplio, añadir verificación server-side de Cloudflare Turnstile y revisar límites/cuotas de gasto de Gemini. Esta primera integración no incluye todavía el desafío Turnstile.

## Pruebas de aceptación

1. Publicidad audiovisual con IA: confirmar capacidad, explicar IA + producción híbrida y preguntar qué se promociona.
2. Negocio de vinos: mantener el rubro y preguntar si produce, distribuye o vende.
3. Cafetería: orientar sobre atención, pedidos y catálogo sin afirmar que existe integración real.
4. Sitio web: distinguir web institucional de tienda o plataforma.
5. Automatización: preguntar por el proceso actual antes de proponer arquitectura.
6. Precio: no inventar cifras ni cotizaciones.
7. Disponibilidad: no confirmar citas o reservas sin una fuente conectada.
8. Consulta ajena a Automata: reconocer el límite de función.
9. Continuidad: no pedir de nuevo información ya entregada.
10. WhatsApp: no mostrar el resumen al primer mensaje; mostrar la opción tras tres mensajes del cliente o una solicitud explícita; resumen editable y autorización obligatoria.
11. Seguridad: comprobar que una petición desde otro origen se rechaza y que la clave no aparece en los archivos compilados.

## Privacidad y operación

Antes de abrir el asistente, la web debe informar que los mensajes se procesan mediante un proveedor de IA para responder la consulta. No pedir datos sensibles. El historial vive en el estado de la pestaña y no se guarda en una base de datos. La persona controla qué contenido comparte al pasar a WhatsApp.

**Importante sobre datos de clientes:** Google indica que el nivel gratuito puede utilizar el contenido enviado para mejorar sus productos; en el nivel pagado indica que ese contenido no se utiliza con ese fin. Por eso, usa ejemplos ficticios en las pruebas gratuitas. Antes de recibir consultas reales de clientes, activa el nivel pagado y vuelve a revisar las condiciones vigentes. Consulta la [página oficial de precios y tratamiento de datos de Gemini](https://ai.google.dev/gemini-api/docs/pricing).

Revisar consumo, límites y errores en Cloudflare y Google AI Studio durante la etapa piloto. Los límites del Worker reducen abuso accidental, pero no son una garantía de gasto máximo: configura alertas y revisa el consumo de la API.

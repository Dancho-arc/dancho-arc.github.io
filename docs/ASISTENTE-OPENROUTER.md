# Asistente comercial de Automata con OpenRouter y Nemotron

## Arquitectura

- **Frontend:** React + Vite en GitHub Pages.
- **Backend:** Cloudflare Worker en `worker/`.
- **Proveedor:** OpenRouter mediante API compatible con OpenAI.
- **Modelo inicial:** `nvidia/nemotron-3.5-super-vl:free`.
- **Secreto:** `OPENROUTER_API_KEY` únicamente en Cloudflare Worker Secrets.
- **Modelo configurable:** `OPENROUTER_MODEL` en `worker/wrangler.jsonc`.
- **Transferencia:** el navegador prepara un resumen editable y abre WhatsApp solo después de autorización explícita. El modelo no controla esa acción.

## Configuración del secreto

En Cloudflare, abre el Worker `automata-chat` y entra a **Settings → Variables and Secrets**.

Crea o actualiza:

- Nombre: `OPENROUTER_API_KEY`
- Tipo: **Secret**
- Valor: la API Key creada en OpenRouter.

No guardes esta clave en Git, GitHub Actions, el frontend ni conversaciones. La variable pública `OPENROUTER_MODEL` ya está definida en `worker/wrangler.jsonc`.

## Modelo y petición

El Worker llama a:

```text
POST https://openrouter.ai/api/v1/chat/completions
```

Envía la instrucción de sistema aprobada y convierte los roles internos `user/model` a `user/assistant`. La respuesta se obtiene de `choices[0].message.content`.

Parámetros actuales:

- Modelo: `nvidia/nemotron-3.5-super-vl:free`.
- Temperatura: `0.3`.
- Máximo de salida: 700 tokens.
- Razonamiento: desactivado para reservar el presupuesto de salida para la respuesta visible.
- Timeout: 55 segundos.

## Conectar GitHub Pages

En el repositorio `automata-bo/automata-bo.github.io`, abre:

**Settings → Secrets and variables → Actions → Variables → New repository variable**

Crea o conserva:

- Nombre: `VITE_AUTOMATA_API_URL`
- Valor: URL raíz del Worker, sin barra final. Ejemplo: `https://automata-chat.<tu-subdominio>.workers.dev`

La variable es una URL pública, no un secreto. La clave de OpenRouter permanece en Cloudflare.

## Controles incluidos

- CORS limitado al dominio de Automata.
- Clave de OpenRouter solo en el backend.
- Límite de 20 mensajes, 1.800 caracteres por mensaje y 12.000 caracteres por conversación.
- Rate limiting aproximado por sesión y por IP.
- Timeout de 55 segundos.
- Errores del proveedor registrados sin exponer la clave ni el contenido de mensajes.
- No se persiste el historial en el Worker ni se registran mensajes de clientes.
- El modelo no puede ejecutar acciones, enviar mensajes ni abrir WhatsApp.
- Catálogo comercial y límites de promesas incluidos en la instrucción de sistema.

Los límites de Cloudflare son aproximados y se aplican por ubicación. No equivalen a un control antifraude estricto ni sustituyen la supervisión del consumo del proveedor. CORS tampoco es autenticación: un cliente automatizado puede falsificar el encabezado Origin.

## Uso de la ruta gratuita

La ruta `:free` sirve para cerrar la demo y realizar pruebas limitadas. OpenRouter aplica límites de uso a los modelos gratuitos y puede cambiar su disponibilidad.

**No enviar información confidencial, datos personales ni conversaciones reales de clientes mediante esta ruta gratuita.** Utilizar datos ficticios o información pública mientras se mantenga el plan gratuito. Antes de atender clientes reales, revisar las condiciones vigentes de privacidad, retención y tratamiento de datos de OpenRouter y del proveedor de inferencia, y pasar a una ruta pagada adecuada.

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
12. Respuesta: comprobar que el Worker entrega texto no vacío en `answer`, no solo HTTP 200.

## Operación

La web debe informar que los mensajes se procesan mediante un proveedor de IA para responder la consulta. No pedir datos sensibles. El historial vive en el estado de la pestaña y no se guarda en una base de datos. La persona controla qué contenido comparte al pasar a WhatsApp.

Revisar consumo, límites y errores en Cloudflare y OpenRouter durante la etapa piloto. Los límites del Worker reducen abuso accidental, pero no garantizan un gasto máximo.

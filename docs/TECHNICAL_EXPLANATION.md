# Guía de Explicación Técnica (A nivel de Código)

Esta guía te servirá para defender y explicar la lógica a nivel de código durante la presentación. Está dividida por componentes clave, explicando **qué función se ejecuta**, **qué hace** y **cómo lo resuelve**.

---

## 1. BACKEND (Django REST Framework y Python)

El backend es el "cerebro" y el encargado de proteger la base de datos (PostgreSQL). A los profesores les gusta ver cómo proteges los datos y la consistencia.

### A. La inmutabilidad y la estructura de Datos (`shop/models.py`)
No vendemos "Productos" abstractos, vendemos "Variantes Físicas".

*   **Modelo `ProductVariant`:**
    *   **Qué hace:** Separa el producto general (ej. Chaqueta) en ítems únicos por talla (S, M, L) y les da una unidad de stock a cada uno. 
    *   **Por qué importa:** Porque si alguien compra Talla S, solo debe restar stock de la Talla S, no de la chaqueta general.
*   **Modelo `Order` y `OrderItem` (El Snapshot):**
    *   **Qué hace:** En `OrderItem`, existe un campo llamado `price_at_purchase` (Precio al momento de compra).
    *   **Por qué importa:** Si hoy compro algo en $100 y mañana el admin le sube el precio a $200, mi boleta histórica no debe cambiar mágicamente a $200. Se guarda una "foto" inmutable del precio en ese segundo exacto.

### B. El Checkout y la Protección de Datos (La Joya de la Corona)
*Archivo:* `shop/views.py` -> **Clase `CheckoutView`**

Esta es la función más importante de tu API. Combina varias herramientas avanzadas:

*   **`@transaction.atomic()` (Transacciones Base de Datos):**
    *   **Qué hace:** Envuelve TODO el proceso de pago en un solo bloque. Si *cualquier* cosa falla (ej. Stripe rechaza la tarjeta o no hay stock en el último segundo), la transacción hace **Rollback** (revierte todo).
    *   **Por qué importa:** Evita que el sistema le cobre dinero a un usuario si el sistema falló guardando la orden, y evita que se cree la orden temporal si no hubo pago. Es todo o nada.
*   **`select_for_update()` (Bloqueo Pesimista):**
    *   **Qué hace (Línea de código clave):** `ProductVariant.objects.select_for_update().filter(...)`
    *   **Cómo funciona:** Toma la fila de la base de datos y le pone un candado (Lock) exclusivo hasta que la transacción termine de cobrar.
    *   **El Escenario que soluciona:** Hay 1 sola prenda en stock. El Usuario A y el Usuario B le dan a "Pagar" al mismo milisegundo. Sin este bloqueo, el servidor lee "Hay 1 prenda" para ambos, les cobra a ambos, y el stock queda en -1 (sobreventa). **Con `select_for_update`**, el Usuario A bloquea la fila. El servidor del Usuario B tiene que esperar. Cuando el Usuario A termina, el stock queda en 0. Luego entra el Usuario B, el sistema lee "0 prendas", y rechaza la compra devolviéndole su dinero.

### C. Autenticación Personalizada (`users/models.py`)
*   **Modelo `CustomUser`:**
    *   **Qué hace:** Sobrescribe el usuario por defecto de Django eliminando el campo inútil de `username` para forzar a usar `email` como identificador principal. Usa `BaseUserManager` para estandarizar el guardado y encriptación de las contraseñas usando algoritmos seguros (PBKDF2 por defecto en Django).

---

## 2. FRONTEND (Next.js y React)

El frontend no es solo "HTML", tiene muchísima lógica para mantener un estado fluido (App Router).

### A. Estado del Carrito Ultrarrápido (Zustand)
*Archivo:* `frontend/src/lib/store.ts`

*   **Librería `Zustand`:** En lugar de usar React Context (que es lento y causa recargas innecesarias), usamos Zustand para crear un estado global llamado `useCartStore`.
*   **Función `addItem` y `removeItem`:**
    *   **Qué hace:** Cuando agregas un producto, no recargas la pestaña ni haces peticiones HTTP lentas en ese momento. Zustand toma la data del producto, la inyecta en estado reactivo, e inmediatamente actualiza el numerito del carrito arriba a la derecha. 
    *   **Persistencia:** Utiliza un middleware llamado `persist` para guardar silenciosamente el carrito en el `localStorage` del navegador. Si cierras la pestaña y la abres a los 3 días, tu carrito sigue ahí intacto sin necesidad de que el backend guarde esa basura temporal.

### B. Comunicación con el Backend (`fetchAPI`)
*Archivo:* `frontend/src/lib/api.ts` -> **Función `fetchAPI(endpoint, options)`**

*   **El Interceptor de Tokens (Wrapper):**
    *   **Qué hace:** Esta función "envuelve" la función normal de javascript `fetch()`. Su trabajo principal es verificar si el usuario tiene un Token de sesión guardado (Access Token).
    *   **Cómo funciona:** Si lo tiene, automáticamente toma el token y se lo adjunta a la cabecera (Header: `Authorization: Bearer <token>`) de TODAS las llamadas a la API que requieran seguridad (como crear una orden). Funciona como un pasaporte automático. También incluye estandarización de errores (si DRF devuelve errores tipo diccionario, los mapea para mostrarlos bonitos en la interfaz).

### C. Client Components vs Server Components (Next.js App Router)
*Archivo:* `frontend/src/app/checkout/page.tsx` vs `page.tsx`

*   **`"use client"` (Directiva React):** 
    *   A los profesores les importará por qué algunas páginas tienen esto. Los marcamos así en páginas como el Checkout o el Carrito porque interactúan con "eventos on-click" del usuario y con el `localStorage` (como Zustand).
    *   El resto de la aplicación (los layouts, etc.) intentan cargarse Server-Side (del lado del servidor) para ser rápidos y tener buen SEO (Search Engine Optimization).

---

## CONSEJOS PARA LA PRESENTACIÓN

*   **Si te preguntan "Por qué Stripe en Mock y no en Real":** "La lógica de negocio está completa: tenemos los serializers de Django recibiendo y creando intents. Está mockeado exclusivamente para esta demo offline/local y poder ver cómo el PaymentIntentId se mapea perfectamente a nuestra base de datos posicional, pero la integración SDK (Librería) está instalada y requiriendo solo las llaves de entorno para producción."
*   **Si te preguntan "¿Qué pasa si hay mucho tráfico?":** "Gracias a que usamos Docker y separamos frontend (Next.js) de backend (Django), podemos escalar los contenedores de Django de forma horizontal en un load balancer si hay un Drop masivo, manteniendo la misma base de datos relacional."

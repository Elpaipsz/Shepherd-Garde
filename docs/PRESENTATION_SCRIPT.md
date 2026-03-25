# Guión Completo para Presentación: Shepherd Garde

*Esta guía está diseñada para que la leas, entiendas cada parte de tu proyecto, y tengas un paso a paso exacto de qué decir y qué mostrar durante tu presentación de 10 minutos.*

---

## PARTE 1: INTRODUCCIÓN Y CONCEPTO (2 minutos)
*Lo que debes decir para enganchar al profesor/audiencia.*

**"Buenos días/tardes. Hoy presento Shepherd Garde."**

**¿Qué es el proyecto?** 
"Shepherd Garde no es un e-commerce tradicional. Es una plataforma orientada a la moda de alto nivel (High-end) y 'Streetwear'. Funciona bajo el modelo de **'Drops'** o colecciones exclusivas de tiempo limitado, por lo que el sistema requiere un manejo de inventario muy estricto."

**Diferenciador Visual:**
"A nivel de diseño, implementé una interfaz limpia, minimalista y de lujo que llamé 'Ethereal Brutalism'. No hay menús saturados; el foco es 100% el producto y las imágenes."

**Arquitectura Tecnológica (El Stack):**
"El proyecto es Full-Stack y está completamente contenerizado con **Docker** (tenemos 3 contenedores corriendo simultáneamente):
1. **Frontend:** Construido en React con **Next.js** (App Router), usando Tailwind CSS v4 para los estilos y la librería Zustand para manejar el estado del carrito de compras.
2. **Backend:** Construido en Python con **Django REST Framework** para crear la API.
3. **Base de Datos:** Usamos **PostgreSQL** montado en su propio contenedor."

---

## PARTE 2: FUNCIONALIDADES PRINCIPALES (Explicación técnica)
*Menciona esto rápidamente para demostrar que dominas la lógica del sistema.*

*   **Modelado de Productos y Variantes:** "Un producto no es solo un ítem. Un producto (ej. Chaqueta) tiene 'Variantes' (Talla S, Talla M). El inventario y los precios se controlan a nivel de *Variante*, no de producto general."
*   **Gestión de Colecciones (Drops):** "Los productos pertenecen a colecciones que pueden activarse o desactivarse, simulando cómo funcionan los lanzamientos de marcas exclusivas."
*   **Manejo de Estado del Carrito:** "El carrito vive en el Frontend usando *Zustand*, lo que permite que sea ultra rápido y no requiera recargar la página."
*   **Bloqueo Pesimista (Pessimistic Locking):** "Para evitar que dos personas compren exactamente la misma última prenda al mismo tiempo, el backend bloquea ese registro en la base de datos temporalmente durante el checkout."

---

## PARTE 3: DEMOSTRACIÓN EN VIVO (Paso a Paso)
*Sigue este guión exacto mientras compartes pantalla.*

### Paso 1: El Home (Landing Page)
1. Abre `http://localhost:3000`
2. **Qué decir:** "Esta es la landing page principal. Vemos el Hero Banner destacando el 'Drop 04'. Más abajo, el frontend hace una petición GET a la API de Django para traer dinámicamente los productos destacados."
3. *Haz scroll hacia abajo para mostrar los 3 productos cargados.*

### Paso 2: Registro de Usuario (Autenticación)
1. Clic en **"Login"** (arriba a la derecha) y luego en **"Create Account"** (`/register`).
2. **Qué hacer:** Llena los datos con un correo de prueba (ej. `profesor@test.com`).
3. **Qué decir:** "El sistema cuenta con un modelo de usuario personalizado en Django, donde el email es el identificador principal en lugar del username tradicional. Al registrarnos, la contraseña se hashea por seguridad antes de guardarse en la base de datos PostgreSQL."

### Paso 3: Exploración del Catálogo y Producto (PDP)
1. Navega a **"Catalog"** (`/catalog`).
2. **Qué decir:** "Aquí listamos todos los productos activos. Seleccionemos uno para ver el detalle."
3. Haz clic en la Chaqueta (Shadow Shell Jacket).
4. **Qué decir:** "Esta es la vista de detalle de producto (PDP). Fíjense que podemos seleccionar Talla. Cada talla es una 'Variante' distinta en la base de datos con su propio stock."
5. Selecciona la Talla "M" y haz clic en **"Add to Cart"**.
6. **Qué decir:** "Al agregarlo, el manejador de estado (Zustand) actualiza el carrito instantáneamente sin recargar la página."

### Paso 4: El Checkout y la Simulación de Pago
1. Abre el carrito y dale clic a **"Checkout"**.
2. **Qué decir:** "Llegamos a la pasarela de pago. Para propósito de esta demo, estoy simulando una respuesta exitosa de Stripe. El backend recibe los datos, verifica el inventario, crea una Orden inmutable, resta el stock de esa variante y genera un Payment Intent ID falso para rastreo."
3. Llena la dirección local con cualquier dato y dale a **"Pay Now"**.
4. **Qué decir:** "La compra procesó correctamente. Somos redirigidos a la página de éxito que consulta la API para traer el resumen exacto de la Orden generada."

### Paso 5: Demostración del Panel de Control (Admin)
*Este es el cierre donde pruebas que todo lo que pasó es real en la base de datos.*

1. Abre una nueva pestaña y entra a `http://localhost:8000/admin/`
2. Inicia sesión con: `admin@demo.com` / `DemoAdmin123!`
3. **Qué decir:** "Finalmente, desde la perspectiva administrativa, tenemos el panel de Django."
4. Clic en **"Users"**: "Aquí pueden ver el usuario que acabo de registrar en el paso 2 (`profesor@test.com`)."
5. Clic en **"Orders"**: "Y aquí está la orden que acabamos de completar. Si entramos, verán que está marcada como **Paid**, tiene asociado un ID de transacción (_Payment Intent ID_), y vemos la variante exacta (Talla M) que compró el usuario."

---

## 4. CONCLUSIÓN Y CIERRE (1 minuto)

**"En conclusión, Shepherd Garde es un sistema distribuido funcional. Logramos integrar exitosamente Next.js con Django REST Framework, usando PostgreSQL, todo orquestado fácilmente gracias a Docker. Abordamos problemas reales como la inmutabilidad de una orden y el manejo de inventario estructurado por variantes."**

**"¿Tienen alguna pregunta?"**

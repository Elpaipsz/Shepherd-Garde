# Shepherd Garde - Documento de Requisitos (API REST)

## 1. Actores del Sistema
El sistema interactúa con tres perfiles principales:

1. **Usuario Anónimo (Guest)**: Visitante en la tienda sin autenticación.
2. **Cliente Registrado (Customer)**: Usuario autenticado (con cuenta creada) activo en la plataforma.
3. **Administrador (Admin)**: Usuario con nivel de *staff/superuser* que gestiona el inventario, ventas y plataforma general.

---

## 2. Requisitos Funcionales Principales

### 2.1. Usuario Anónimo
* **Explorar Catálogo**: Debe poder consultar la lista de productos (paginados), buscar por texto, y filtrar por categorías/marcas/precios.
* **Detalle de Producto**: Debe poder ver el detalle de un producto específico, incluyendo sus variantes (tallas, colores) y disponibilidad (stock).
* **Carrito de Compras (Invitado)**: Debe poder crear un carrito temporal (asociado a un Session ID o Device ID) para agregar o quitar productos antes del registro.
* **Registro (Sign-Up)**: Debe poder crear una cuenta proporcionando email, contraseña y datos personales básicos.

### 2.2. Cliente Registrado
* **Autenticación (Log-In)**: Debe poder iniciar sesión y obtener credenciales de acceso (Token).
* **Perfil y Direcciones**: Debe poder gestionar su cuenta y guardar/editar múltiples direcciones de envío o facturación.
* **Carrito Persistente**: Debe poder mantener sus productos en el carrito de compras a través de distintas sesiones o dispositivos.
* **Checkout**: Debe poder procesar la compra de los artículos en su carrito, eligiendo una dirección y completando la pasarela de pago.
* **Historial de Órdenes**: Debe poder consultar todos sus pedidos anteriores, viendo detalles (monto, fecha, ítems) y el estado actual (pendiente, procesando, enviado, completado).

### 2.3. Administrador
* **Gestión de Catálogo (CRUD)**: Debe poder crear, editar o eliminar productos, familias (categorías, marcas) y gestionar el inventario de variantes.
* **Gestión de Órdenes**: Debe poder listar todas las transacciones de ventas y actualizar sus estados de procesamiento y envío.
* **Gestión de Clientes**: Debe tener acceso de lectura al listado de usuarios y órdenes asociadas, con la capacidad de suspender cuentas en caso de fraude o soporte.

---

## 3. Requisitos No Funcionales

* **Seguridad y Autenticación**:
  * La API estará protegida bajo el estándar **JSON Web Tokens (JWT)** para autenticación *stateless*, facilitando la separación con cualquier frontend.
  * Todas las credenciales sensibles deben estructurarse de acuerdo a las mejores prácticas de hashing (PBKDF2 nativo de Django).

* **Arquitectura de la API (REST)**:
  * El diseño de URIs será coherente y predecible a través de la convención REST (ej. `GET /api/v1/orders/`, `POST /api/v1/auth/login/`).
  * Devolverá **siempre** formato JSON estandarizado y hará un uso correcto de verbos (GET, POST, PUT, PATCH, DELETE) y códigos de estado HTTP (200, 201, 400, 401, 403, 404, 500).

* **Escalabilidad y Despliegue**:
  * El backend operará puramente **stateless** (sin estado mantenido en el servidor de aplicación), de forma que sea contenerizable al 100% con **Docker** y permita ser escalado horizontalmente (múltiples réplicas simultáneas).
  * Las imágenes (avatares, fotos de productos) serán delegadas eventualmente a un *Object Storage* (AWS S3, Cloudinary), omitiendo usar el disco duro del servidor para contenido estático o media.

* **Tiempo de Respuesta (Performance)**:
  * Las peticiones de lectura general del catálogo deben resolverse rápidamente (target < 200ms). Se aplicará paginación estricta desde el inicio para evitar sobrecarga y se deja preparado el terreno para usar caché nativa (Redis) posteriormente si hay bloqueos de lectura base.

---

## 4. Reglas Críticas de Negocio (Drops vs Catálogo Fijo)

* **Prevención Estricta de Overselling en Drops**:
  * La validación y descuento de inventario durante el checkout debe ser completamente atómica.
  * Se utilizará `select_for_update()` de Django en las transacciones de BD para aplicar un bloqueo pesimista a nivel de fila sobre las `ProductVariant`, evitando condiciones de carrera masivas durante lanzamientos de alta demanda.

* **Lógica de Hype (Lanzamientos A Futuro)**:
  * Los productos pertenecientes a un Drop tendrán un `release_date`.
  * La API expondrá estos productos en modo "Preview", permitiendo su visualización anticipada en el catálogo.
  * Por regla de negocio, los endpoints del Carrito de Compras rechazarán (HTTP 400/422) cualquier intento de agregar un ítem cuyo `release_date` sea posterior a la fecha y hora actual.

* **Catálogo Fijo (Línea Permanente)**:
  * Las colecciones regulares o "de línea" no tendrán un `end_date` definido.
  * El sistema las tratará como colecciones perpetuas, conviviendo en la misma arquitectura junto a los Drops de corta duración.

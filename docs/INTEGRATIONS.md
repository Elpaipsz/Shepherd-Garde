# Shepherd Garde - Integraciones y Pruebas

Este documento detalla la arquitectura de integraciones críticas de terceros y estabilización del backend para asegurar un e-commerce robusto, escalable y persistente al usar Docker.

---

## 1. Gestión de Multimedia (Imágenes de Productos)

Dado que usar Docker implica contenedores con estado *efímero* (el almacenamiento interno se destruye al recrear/actualizar el contenedor), almacenar imágenes de productos localmente en el servidor es inaceptable para producción.

### Solución Arquitectónica
* **Terceros**: Delegaremos el almacenamiento de objetos a un servicio Cloud (ej. AWS S3, DigitalOcean Spaces, o Cloudinary).
* **Librería Django**: Integraremos `django-storages` con el adaptador de `boto3`.
* **Mecánica**: 
  1. Al crear/actualizar un producto desde el panel de administrador, la imagen se enviará directamente de Django hacia el Object Storage.
  2. Django solo guardará en la base de datos la URL pública (`https://my-bucket.s3.amazonaws...`) dentro de su `models.ImageField()`.
  3. La API devolverá esa URL al Frontend. El contenedor Docker permanecerá 100% *stateless* (sin estado local de imágenes).

---

## 2. Webhooks de Pagos y Seguridad

El flujo de pago es crítico. **Bajo ninguna circunstancia** la API de Django confiará en que el Frontend (React/Vue/App Móvil) notifique que "El pago fue exitoso". El cliente podría interceptar o falsificar dicha petición.

### Arquitectura de Webhook a Servidor (S2S)
1. **Inicio**: El cliente hace Frontend -> `POST /api/v1/orders/checkout/`.
2. **Intención**: Django reserva el stock (bloqueo en BD) y devuelve un `Client_Secret` al Frontend para que inicie la pasarela de pagos.
3. **Notificación Directa**: Cuando el cliente paga en Stripe (o equivalente), es el servidor de **Stripe** quien envía una petición HTTP `POST` directa (Webhook) al servidor de **Django**, evadiendo el frontend del usuario.
4. **Validación Criptográfica**: Django utilizará un *Signing Secret* (proveído por Stripe e inyectado en `.env`) para verificar matemáticamente la firma de la petición. Si es válida, muta el estado de la Orden a `Paid` y descuenta el stock definitivo. Si alguien intenta hacer una petición falsa al webhook de Django, la verificación criptográfica fallará (HTTP 403 Forbidden).

---

## 3. Estrategia de Testing (Pytest)

Para soportar las transacciones de negocio asíncronas y los bloqueos pesimistas, utilizaremos `pytest` en conjunto con `pytest-django`.

### Flujo Crítico obligatoriamente bajo cobertura (Top 3)

Al ser un e-commerce, el flujo de "Overselling" es la zona de mayor riesgo. Debemos implementar las siguientes pruebas unitarias y de integración para el Checkout:

1. **Test de Rechazo Pre-Drop (Hype Logic)**:
   * **Objetivo**: Garantizar que un usuario reciba `HTTP 400 Bad Request` si intenta añadir un `ProductVariant` al Carrito antes de su `release_date`.
2. **Test de Concurrencia Simulada (Overselling Prevention)**:
   * **Objetivo**: Probar la lógica del `select_for_update()`. Simular a dos usuarios distintos (`User A`, `User B`) que inicialicen el `checkout/` exigiendo la misma última unidad de la variante `SKU-XYZ`. El test debe asegurar que solo 1 orden proceda a "Pendiente de Pago" y el segundo arroje error por stock insuficiente.
3. **Test de Expiración de Reserva (Timeout/Rollback)**:
   * **Objetivo**: Simular que el usuario crea una Orden (el stock queda "reservado"), forzar la expiración simulando el paso del reloj y verificar que el stock retenido vuelva a incrementar en la variante original si no entra un webhook de "Pagado" en el tiempo establecido.

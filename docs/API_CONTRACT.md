# Shepherd Garde - API Contract (RESTful)

Este documento define el contrato de diseño para los endpoints críticos del backend (Django + DRF) asumiendo el prefijo base `/api/v1/`.

---

## 1. Catálogo (Lectura)

### 1.1 Listar Colecciones Activas
* **URL:** `/api/v1/catalog/collections/`
* **Method:** `GET`
* **Headers:** Ninguno (Acceso público).
* **Query Params:** `?is_preview=true` (Para listar colecciones de "Hype" futuras).
* **Response (200 OK):**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "123e4567-e89b-12d3...",
      "name": "Summer Drop 2026",
      "slug": "summer-drop-2026",
      "is_droppable": true,
      "release_date": "2026-06-01T12:00:00Z",
      "is_active": false,
      "is_preview": true
    },
    {
       "id": "987e6543-e21b-34d1...",
       "name": "Essentials (Línea)",
       "slug": "essentials",
       "is_droppable": false,
       "release_date": null,
       "is_active": true,
       "is_preview": false
    }
  ]
}
```

### 1.2 Detalle de Producto y Variantes
* **URL:** `/api/v1/catalog/products/<slug>/`
* **Method:** `GET`
* **Response (200 OK):**
```json
{
  "id": "555e1111-e89b-12d3...",
  "name": "Classic Heavyweight Hoodie",
  "slug": "classic-heavyweight-hoodie",
  "base_price": "89.99",
  "collection": "essentials",
  "variants": [
    {
      "id": "var-111",
      "sku": "HOOD-BLK-M",
      "size": "M",
      "color": "Black",
      "stock": 45,
      "price_override": null
    }
  ]
}
```

---

## 2. Gestión de Carrito (Cart)

El Carrito soportará tanto usuarios logueados (usando el `Authorization: Bearer <token>`) como sesiones anónimas (usando un Header opcional `X-Session-ID`).

### 2.1 Obtener Carrito Actual
* **URL:** `/api/v1/cart/`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <token>` (opcional) o `X-Session-ID: <uuid>` (opcional).
* **Response (200 OK):**
```json
{
  "id": "cart-uuid...",
  "session_id": "anon-session-uuid...",
  "total": "179.98",
  "items": [
    {
      "id": "item-uuid...",
      "variant": {
          "id": "var-111",
           "sku": "HOOD-BLK-M",
           "name": "Classic Heavyweight Hoodie - M Black"
      },
      "quantity": 2,
      "subtotal": "179.98"
    }
  ]
}
```

### 2.2 Agregar/Modificar Item en Carrito
Aplica la regla de negocio: Rechazará la petición (HTTP 400) si la variante pertenece a un *Drop* cuyo `release_date` es futuro.
* **URL:** `/api/v1/cart/items/`
* **Method:** `POST`
* **Payload Request:**
```json
{
  "variant_id": "var-111",
  "quantity": 1
}
```
* **Response (200 OK / 201 Created):** Retornará el estado del carrito actualizado (mismo formato que GET `/api/v1/cart/`).
* **Response de Error por Drop Cerrado (400 Bad Request):**
```json
{
  "error": "product_not_released",
  "message": "Este artículo pertenece a un Drop que será liberado el 2026-06-01T12:00:00Z."
}
```

### 2.3 Remover Item
* **URL:** `/api/v1/cart/items/<item_id>/`
* **Method:** `DELETE`
* **Response (204 No Content):** (Vacío)

---

## 3. Checkout y Órdenes

### 3.1 Iniciar Transacción / Crear Orden (Bloqueo Pesimista)
Toma el carrito activo del usuario, aplica el `select_for_update()` en inventario para reservar stock y crea una Orden "Pendiente de Pago".
* **URL:** `/api/v1/orders/checkout/`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`
* **Payload Request:**
```json
{
  "shipping_address_id": "addr-uuid..."
}
```
* **Response (201 Created):**
```json
{
  "order_id": "ord-uuid...",
  "order_number": "SHP-2026-0001",
  "status": "Pending_Payment",
  "total_amount": "179.98",
  "payment_intent_client_secret": "pi_3MtwBwLkd..._secret_...",
  "expires_at": "2026-02-25T12:45:00Z" 
}
```
*(Nota: `expires_at` indica en qué momento se levantará el bloqueo si no se recibe confirmación de pago).*

### 3.2 Webhook Confirmación de Pago
Endpoint llamado directamente por el proveedor de pagos (ej. Stripe). Efectúa la deducción permanente del *stock* y muta la Orden a `Paid`.
* **URL:** `/api/v1/orders/webhook/payment-success/`
* **Method:** `POST`
* **Headers:** `Stripe-Signature: t=16788...,v1=...`
* **Payload Request:** (Definido por Stripe/Paypal).
* **Response (200 OK):**
```json
{
  "received": true
}
```

# Diagrama de Flujo - Shepherd Garde

A continuación se presentan los flujos principales de la aplicación para la demostración del proyecto.

## 1. Flujo de Registro y Autenticación (Demo)

Este flujo demuestra cómo un usuario se registra en la plataforma y cómo la información es validada y guardada en el backend.

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as Frontend (Next.js)
    participant AuthStore as Auth Store (Zustand)
    participant Backend as API Backend (Django)
    participant DB as Base de Datos (PostgreSQL)

    Usuario->>Frontend: Ingresa a /register
    Usuario->>Frontend: Completa formulario (Nombre, Apellido, Email, Password)
    Frontend->>AuthStore: register({email, password, first_name, last_name})
    AuthStore->>Backend: POST /api/v1/auth/register/
    
    alt Datos Inválidos o Usuario Existente
        Backend-->>AuthStore: 400 Bad Request (Error Msg)
        AuthStore-->>Frontend: Lanza Excepción
        Frontend-->>Usuario: Muestra mensaje de error en pantalla
    else Datos Válidos
        Backend->>DB: Crea nuevo registro de User
        DB-->>Backend: OK
        Backend-->>AuthStore: 201 Created (User Data + Tokens)
        AuthStore->>AuthStore: Guarda accessToken y refreshToken
        AuthStore-->>Frontend: Redirige a Home '/'
        Frontend-->>Usuario: Muestra estado autenticado (Mi Cuenta)
    end
```

## 2. Flujo de Compra y Carrito (Checkout)

Flujo regular de un cliente que explora los drops temporales, añade al carrito y procesa el pago.

```mermaid
sequenceDiagram
    actor Cliente
    participant Frontend as Frontend (Next.js)
    participant CartStore as Cart Store (Zustand)
    participant Backend as API Backend (Django)

    Cliente->>Frontend: Explora Catálogo (/catalog)
    Frontend->>Backend: GET /api/v1/store/products/
    Backend-->>Frontend: Retorna productos activos (Drops)
    
    Cliente->>Frontend: Selecciona Talla y Color -> "Add to Cart"
    Frontend->>CartStore: addItem(variant_id, quantity)
    CartStore->>Backend: POST /api/v1/store/cart/items/
    Backend-->>CartStore: Retorna Carrito Actualizado
    CartStore-->>Frontend: Actualiza UI (Slide-out / Cart Page)

    Cliente->>Frontend: Navega a /checkout
    Frontend->>CartStore: fetchCart()
    CartStore->>Backend: GET /api/v1/store/cart/
    Backend-->>CartStore: Datos de ítems y total
    CartStore-->>Frontend: Renderiza Detalles de Orden

    Cliente->>Frontend: Ingresa Datos de Envío y Tarjeta -> "Pay Now"
    Frontend->>Backend: POST /api/v1/store/checkout/ (Bloqueo Pesimista)
    
    alt Stock No Disponible
        Backend-->>Frontend: 400 Out of Stock
        Frontend-->>Cliente: Notifica expiración de stock
    else Stock Disponible
        Backend->>Backend: Reserva de Stock (15 mins)
        Backend-->>Frontend: 200 OK - Redirige a Pasarela
        Frontend->>Cliente: Confirmación de Orden y Limpieza de Carrito
    end
```

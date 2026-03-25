# Guía de Presentación - Shepherd Garde

**Duración:** 10 minutos (Máximo) + 1 a 3 minutos de preguntas.

## 1. Introducción y Contexto (2 minutos)
*   **El Proyecto:** Presenta "Shepherd Garde", una plataforma de e-commerce de alto nivel (High-end) orientada a "Drops" exclusivos de ropa.
*   **Diferenciador:** Se aleja del retail caótico tradicional. Ofrece una experiencia limpia, minimalista y de lujo (Ethereal Brutalism, "No-Line" UI, canvas alabastro).
*   **Arquitectura Tech:** Frontend en **Next.js** (App Router) + Zustand para el manejo de estado, Tailwind v4. Backend en **Django (REST Framework)** conectado a **PostgreSQL** mediante Docker.

## 2. Diagrama de Clases (2 minutos)
*   *Muestra el archivo `diagrama-de-clases.md` (o la imagen generada por Mermaid).*
*   **Puntos Clave:**
    *   **User & Address:** Relación 1 a muchos, manejando autenticación segura.
    *   **Product, ProductVariant, Collection:** Cómo los productos (modelos) tienen variantes (tallas/colores) que llevan el control individual de stock. Colecciones actúan como los "Drops".
    *   **Cart & CartItem:** Carrito asociado al usuario o sesión anónima.
    *   **Order & OrderItem:** Generación de la orden inmutable con su relación uno a muchos hacia direcciones de envío.

## 3. Demostración en Vivo: Registro de Usuario (2 minutos)
*   **Objetivo:** Mostrar que el backend y frontend están integrados, y la persistencia en base de datos funciona.
*   **Pasos en pantalla:**
    1.  Abre el navegador en `http://localhost:3000`.
    2.  Navega a la página de Registro (`/register`).
    3.  Ingresa los datos del nuevo usuario (Email, Password, Nombre, Apellido).
    4.  Haz clic en "Create Account".
    5.  Destaca que la UI redirige correctamente y (si lo prefieres) muestra la tabla del pgAdmin/DBeaver donde se creó la fila en la base de datos (PostgreSQL conteneirizado).

## 4. Demostración en Vivo: Flujo de Compra y Checkout (3 minutos)
*   *Puedes usar `diagrama-de-flujo.md` como soporte visual antes de hacer los clics.*
*   **Pasos en pantalla:**
    1.  Ir a la vista principal ("Drop Showcase") o al "Catalog".
    2.  Entrar al Detalle del Producto (PDP).
    3.  Seleccionar talla/color y dar clic en "Add to Cart".
    4.  Abrir el carrito o navegar a `/cart` para ver el componente añadido funcionando en tiempo real gracias a Zustand.
    5.  Proceder al `Checkout`.
    6.  Completar un flujo local de checkout hasta llegar a la parte final.
    7.  Menciona el "Bloqueo Pesimista" (Reservar el stock por 15 minutos en el backend) que asegura que en un modelo de "Drops" limitados, dos personas no compren el mismo artículo físico a la vez.

## 5. Conclusión (1 minuto)
*   Resumen del stack tecnológico local (Docker Compose que levanta PostgreSQL, Backend y Frontend simultáneamente).
*   Paso del MVP monolítico o aislado a un sistema de servicios bien acoplado mediante APIs REST. 
*   **Apertura a preguntas del docente.**

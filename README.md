# Shepherd Garde - Ethereal Brutalism E-commerce

Shepherd Garde es una plataforma de e-commerce de alto nivel conceptualizada bajo el diseño de **Ethereal Brutalism**. Está orientada exclusivamente a lanzamientos de colecciones limitadas ("Drops") y Streetwear High-end, priorizando la visualización de los productos sobre los menús tradicionales.

## 🚀 Características Principales

*   **Pessimistic Locking:** Manejo estricto de inventario a nivel de Base de Datos para evitar la sobreventa de productos limitados durante los Drops.
*   **Gestión por Variantes:** Control de inventario y precio basado dinámicamente en Tallas y Colores, en lugar del producto abstracto general.
*   **Inmutabilidad de Órdenes:** Las compras capturan una "foto" (Snapshot) del precio y estado del producto al milisegundo de la compra para mantener la consistencia histórica.
*   **Estado Ultrarrápido:** Gestión del carrito de compras en el cliente mediante **Zustand**, persistiendo los datos sin recargar la página.

## 🛠️ Stack Tecnológico

El proyecto está dividido en un ecosistema robusto de microservicios contenerizados:

*   **Frontend:** React, Next.js (App Router), Tailwind CSS v4, Framer Motion, Zustand.
*   **Backend:** Python, Django, Django REST Framework.
*   **Base de Datos:** PostgreSQL.
*   **Infraestructura:** Docker & Docker Compose.

## 📦 Instrucciones para Ejecución Local (Desarrollo)

El proyecto está 100% contenerizado. Para ejecutarlo localmente en tu máquina solo necesitas tener **Docker** y **Docker Compose** instalados.

### 1. Clonar el repositorio
```bash
git clone https://github.com/Elpaipsz/Shepherd-Garde.git
cd Shepherd-Garde
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo para configurar el entorno local:
```bash
cp .env.example .env
```
*(Asegúrate de revisar el `.env` para ajustar configuraciones si es necesario).*

### 3. Levantar los Contenedores
Inicia simultáneamente la Base de Datos, el Backend (API) y el Frontend:
```bash
docker-compose up --build
```

### 4. Accesos Locales
*   **Frontend (Tienda):** `http://localhost:3000`
*   **Backend (API):** `http://localhost:8000/api/`
*   **Panel de Administración:** `http://localhost:8000/admin/`

---

*Desarrollado para demostración funcional End-to-End de una arquitectura E-commerce.*

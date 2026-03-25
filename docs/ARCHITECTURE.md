# Shepherd Garde - Backend Architecture & Design Document

## 1. Visión General
El backend de **Shepherd Garde** (e-commerce de ropa streetwear) estará construido sobre **Django** y **Django REST Framework (DRF)**. La aplicación funcionará como una API "headless", completamente desacoplada del frontend, y estará contenerizada utilizando **Docker** para asegurar la máxima portabilidad y consistencia entre entornos (desarrollo, testing, producción).

---

## 2. Estructura del Proyecto
Para mantener un código modular y escalable, adoptaremos una estructura basada en "aplicaciones" (Django apps) donde cada app tendrá una responsabilidad única y cohesionada.

```text
shepherd_garde/
├── core/                   # Configuraciones core de Django (settings, wsgi, asgi, urls raiz)
├── apps/                   # Contenedor de los módulos de negocio
│   ├── users/              # Autenticación, perfiles y gestión de roles (Custom User Model)
│   ├── catalog/            # Productos, categorías, marcas, inventario y variantes
│   ├── cart/               # Lógica de carrito de compras
│   ├── orders/             # Gestión de pedidos, historial y estados de compra
│   ├── payments/           # Integración con pasarelas de pago (Stripe, PayPal, MercadoPago)
│   └── common/             # Utilidades, excepciones custom y modelos base compartidos
├── requirements/           # Dependencias del proyecto segmentadas
│   ├── base.txt            # Dependencias comunes (Django, DRF, Gunicorn, psycopg2, etc.)
│   ├── local.txt           # Dependencias de dev (pytest, black, flake8, debug-toolbar)
│   └── production.txt      # Dependencias de producción puras
├── docker/                 # Archivos Docker (ej. entrypoint.sh)
├── Dockerfile              # Definición de la imagen del backend
├── docker-compose.yml      # Orquestación local (Backend + PostgreSQL + Redis)
├── manage.py
└── ARCHITECTURE.md         # Documento de diseño (este archivo)
```

**Nota sobre `apps/`**: Agrupar las aplicaciones dentro de un directorio `apps/` permite mantener la raíz del proyecto limpia.

---

## 3. Manejo de Entornos y Configuración
Separaremos las configuraciones de desarrollo y producción para no cruzar dependencias, proteger credenciales y manejar el servidor óptimamente. Usaremos una librería como `django-environ` o `python-decouple` para inyectar variables de entorno.

### División de `settings.py`
Reemplazaremos el archivo tradicional `settings.py` por un módulo estructurado:

```text
core/
└── settings/
    ├── __init__.py         # Punto de entrada de la config
    ├── base.py             # Configuraciones transversales (INSTALLED_APPS, MIDDLEWARE)
    ├── local.py            # Configs para dev (DEBUG=True, sqlite o postgres local, CORS permisivo)
    └── production.py       # Configs para prod (DEBUG=False, CORS estricto, AWS S3/Cloudinary)
```

### Archivo `.env` (Ignorado en Git)
Toda información sensible (claves, URLs de bases de datos) vivirá en el entorno de ejecución. El archivo `.env` contendrá variables como:
* `DJANGO_SETTINGS_MODULE` (Define qué entorno cargar, ej: `core.settings.local`)
* `SECRET_KEY`
* `DEBUG`
* Variables de base de datos (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`)
* Credenciales de terceros (Mailing, pasarelas de pago, AWS).

---

## 4. Estrategia de API
Al ser un producto web moderno, el backend entregará información de forma limpia e independiente.

* **Tecnología Base**: `Django REST Framework` (DRF).
* **Autenticación**: Utilizaremos JWT (JSON Web Tokens) usando la librería `SimpleJWT`, permitiendo comunicaciones seguras y *stateless* (sin estado) beneficiosas para separar dominios de frontend y backend.
* **Versionado**: Las rutas de la API estarán versionadas (ej. `/api/v1/catalog/products/`) para permitir futuras actualizaciones sin romper clientes existentes.
* **Documentación Automática**: Implementaremos el estándar OpenAPI usando `drf-spectacular` (provee vistas Swagger y Redoc automáticas de nuestras rutas y esquemas).
* **Paginación y Filtros**: Las listas grandes (como productos) usarán paginación global y filtros como `django-filter` acoplados a DRF.

---

## 5. Convenciones y Buenas Prácticas
Para asegurar legibilidad y homogeneidad en el equipo, implementaremos el siguiente stack de calidad de código:

### 5.1. Linting y Formateo
* **Black**: El formateador de código sin compromiso ("The Uncompromising Code Formatter"). Formateará las líneas a una longitud estándar (ej. 88 o 100 caracteres) y usará comillas dobles automáticamente.
* **Flake8**: Analizador estático (linter) para asegurar que se cumpla el PEP8 y encontrar advertencias lógicas (variables importadas pero no usadas, etc).
* **isort**: Ordenará automáticamente las importaciones (Imports de sistema primero, de terceros después, locales al final).
* **Pre-commit**: Usaremos *pre-commit hooks* para que todo commit local deba pasar por Black, isort y Flake8 antes de entrar al repositorio.

### 5.2. Type Hinting
Se exigirá el uso extensivo de *Type Hints* (anotaciones de tipo) de Python para documentar firmas de funciones, mejorando el entendimiento y ayudando al IDE de desarrollo:
```python
def calculate_cart_total(cart_id: uuid.UUID, apply_taxes: bool = True) -> Decimal:
    ...
```

### 5.3. Convenciones de Nomenclatura
* **Modelos y Clases**: `PascalCase` y en singular (ej. `Product`, no `Products`).
* **Variables, Funciones y Métodos**: `snake_case` (ej. `calculate_total`, `is_active`).
* **Constantes**: `UPPER_SNAKE_CASE` (ej. `MAX_ORDER_RETRIES`).
* **Directorios/Módulos**: `snake_case` (ej. `cart_views.py`, `models/`, `serializers.py`).

### 5.4. Buenas Prácticas en Django
1. **Custom User Model**: Desde el día 1, implementaremos un Custom User Model (heredando de `AbstractUser` o `AbstractBaseUser`) en la app `users`. Es crítico hacerlo antes de la primera migración.
2. **Modelos Base**: Usaremos un mixin abstracto (`TimeStampedModel`) que contenga `created_at` y `updated_at` en casi todas nuestras tablas de negocio para auditoría.
3. **Fat Models, Skinny Views**: Mantendremos la lógica de negocio acoplada a los modelos, managers o "servicios" (services layer), y dejaremos que las vistas (Views/ViewSets) se encarguen puramente de peticiones y respuestas HTTP.

FROM python:3.11-slim

# Evitar escritura de bytecode y habilitar output directo
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalar dependencias del sistema requeridas para compilar psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements antes para aprovechar el caché de capas de Docker
COPY requirements.txt /app/

# Instalar dependencias de Python sin usar caché
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY . /app/

# Comando predeterminado para el contenedor web
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]

"""
Django settings for shepherd_garde project — Production-hardened configuration.
"""

import os
from pathlib import Path
from datetime import timedelta

# ──────────────────────────────────────────────
# BASE
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set. Refusing to start.")

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# ALLOWED_HOSTS: comma-separated list from env, e.g. "localhost,api.shepherdgarde.com"
_allowed = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(',') if h.strip()]

# ──────────────────────────────────────────────
# APPLICATIONS
# ──────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # ← enables refresh token invalidation
    'django_filters',
    'corsheaders',
    'storages',

    # Local
    'users',
    'catalog',
    'shop',
]

AUTH_USER_MODEL = 'users.User'

# ──────────────────────────────────────────────
# MIDDLEWARE
# ──────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',          # must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'shepherd_garde.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'shepherd_garde.wsgi.application'

# ──────────────────────────────────────────────
# DATABASE (PostgreSQL — no raw SQL, ORM only)
# ──────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'shepherd_db'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        'OPTIONS': {
            # Connection-level: ensure parameterized queries (psycopg2 default, explicit here)
            'client_encoding': 'UTF8',
        },
        'CONN_MAX_AGE': 60,  # persistent connections
    }
}

# ──────────────────────────────────────────────
# PASSWORD VALIDATION (anti-weak-passwords)
# ──────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ──────────────────────────────────────────────
# INTERNATIONALISATION
# ──────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# STATIC / MEDIA FILES
# ──────────────────────────────────────────────
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

USE_S3 = os.environ.get('USE_S3', 'False') == 'True'

if USE_S3:
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_DEFAULT_ACL = None  # Use bucket policy, not ACLs (security best practice)

    STATIC_LOCATION = 'static'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{STATIC_LOCATION}/'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

    PUBLIC_MEDIA_LOCATION = 'media'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{PUBLIC_MEDIA_LOCATION}/'
    DEFAULT_FILE_STORAGE = 'shepherd_garde.storage_backends.PublicMediaStorage'
else:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ──────────────────────────────────────────────
# DJANGO REST FRAMEWORK + THROTTLING
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],

    # ── Rate Limiting ──────────────────────────────────────────────────
    # Prevents brute force attacks on auth endpoints and API abuse
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',        # anonymous users: 60 req/min globally
        'user': '300/minute',       # authenticated users: 300 req/min globally
        'auth_login': '5/minute',   # login attempts: max 5/minute
        'auth_register': '3/minute', # registrations: max 3/minute per IP
    },
}

# ──────────────────────────────────────────────
# JWT — SIMPLE JWT (Security hardened)
# ──────────────────────────────────────────────
SIMPLE_JWT = {
    # Short-lived access token forces re-authentication more often
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # CRITICAL: Rotating refresh tokens prevents replay attacks.
    # Each time a refresh is used, a NEW refresh token is issued and
    # the old one is BLACKLISTED (invalidated for future use).
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ──────────────────────────────────────────────
# CORS — Cross-Origin Resource Sharing
# ──────────────────────────────────────────────
# NEVER use CORS_ALLOW_ALL_ORIGINS = True in production.
# Only allow requests from your known frontend origins.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True  # Allow cookies/auth headers cross-origin

_cors_origins = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'  # local Next.js dev server only
)
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(',') if o.strip()]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'x-session-id',    # Custom header for anonymous cart sessions
    'x-csrftoken',
]

# ──────────────────────────────────────────────
# SECURITY HEADERS
# ──────────────────────────────────────────────
# Prevent clickjacking (embedding site in an iframe)
X_FRAME_OPTIONS = 'DENY'

# Prevent MIME type sniffing (browsers must respect Content-Type)
SECURE_CONTENT_TYPE_NOSNIFF = True

# Enable browser XSS filter (legacy browsers)
SECURE_BROWSER_XSS_FILTER = True

# Referrer information sent to external sites
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# HTTPS enforcement (only activate in production with HTTPS)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000       # 1 year HSTS
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ──────────────────────────────────────────────
# STRIPE
# ──────────────────────────────────────────────
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY', '')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# ──────────────────────────────────────────────
# EMAIL
# ──────────────────────────────────────────────
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.sendgrid.net')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'apikey')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@shepherdgarde.com')

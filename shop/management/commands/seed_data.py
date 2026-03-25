from django.core.management.base import BaseCommand
from django.utils.text import slugify
from catalog.models import Collection, Product, ProductVariant
from django.utils import timezone
import datetime


class Command(BaseCommand):
    help = 'Carga datos de prueba: colecciones, productos y variantes para Shepherd Garde'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🌱 Limpiando datos anteriores de catálogo...'))
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()
        Collection.objects.all().delete()

        # ── Colección 1: Línea permanente ─────────────────────────────
        essentials = Collection.objects.create(
            name='Shepherd Essentials',
            slug='shepherd-essentials',
            description='Piezas atemporales construidas para durar. El núcleo de Shepherd Garde.',
        )
        self.stdout.write(f'  ✓ Colección: {essentials.name}')

        # ── Colección 2: Drop futuro ───────────────────────────────────
        drop_future = Collection.objects.create(
            name='Owners Club SS25',
            slug='owners-club-ss25',
            description='El Drop más anticipado de la temporada. Acceso limitado.',
            release_date=timezone.now() + datetime.timedelta(days=7),
        )
        self.stdout.write(f'  ✓ Colección (Drop Futuro): {drop_future.name}')

        # ── Colección 3: Drop activo (ya lanzado) ─────────────────────
        drop_active = Collection.objects.create(
            name='Initial Black Label',
            slug='initial-black-label',
            description='La primera colección de Shepherd Garde. Disponible ahora.',
            release_date=timezone.now() - datetime.timedelta(days=14),
        )
        self.stdout.write(f'  ✓ Colección (Drop Activo): {drop_active.name}')

        # ── Productos & Variantes ─────────────────────────────────────
        catalog_data = [
            {
                'collection': essentials,
                'name': 'Core Heavyweight Tee',
                'description': 'Camiseta de 320gsm 100% algodón. Corte oversized con cuello reforzado.',
                'base_price': '89.00',
                'sizes': ['XS', 'S', 'M', 'L', 'XL'],
                'colors': ['Black', 'Off-White'],
                'stock': 30,
            },
            {
                'collection': essentials,
                'name': 'Shepherd Cargo Pant',
                'description': 'Pantalón cargo de tiro medio. Tela ripstop de alta durabilidad.',
                'base_price': '189.00',
                'sizes': ['S', 'M', 'L', 'XL'],
                'colors': ['Olive', 'Black'],
                'stock': 20,
            },
            {
                'collection': essentials,
                'name': 'Guard Hoodie',
                'description': 'Sudadera french terry 400gsm. Interior cepillado para máximo confort.',
                'base_price': '145.00',
                'sizes': ['XS', 'S', 'M', 'L'],
                'colors': ['Charcoal', 'Cream'],
                'stock': 25,
            },
            {
                'collection': drop_active,
                'name': 'Initial Capsule Jacket',
                'description': 'Chaqueta técnica con forro interior desmontable. Edición limitada.',
                'base_price': '320.00',
                'sizes': ['S', 'M', 'L'],
                'colors': ['Black'],
                'stock': 10,
            },
            {
                'collection': drop_active,
                'name': 'Black Label Coach Jacket',
                'description': 'Coach jacket en nylon 210D con bordados en negro mate.',
                'base_price': '275.00',
                'sizes': ['S', 'M', 'L', 'XL'],
                'colors': ['Black', 'Navy'],
                'stock': 15,
            },
            {
                'collection': drop_future,
                'name': 'Owners Club Varsity',
                'description': 'Varsity jacket exclusiva para miembros del Owners Club. Drop limitado.',
                'base_price': '450.00',
                'sizes': ['S', 'M', 'L'],
                'colors': ['Cream', 'Black'],
                'stock': 5,
            },
        ]

        variant_count = 0
        for item in catalog_data:
            product = Product.objects.create(
                collection=item['collection'],
                name=item['name'],
                slug=slugify(item['name']),
                description=item['description'],
                base_price=item['base_price'],
                is_active=True,
            )
            for color in item['colors']:
                for size in item['sizes']:
                    sku = f"SG-{slugify(item['name'])[:12].upper()}-{color[:3].upper()}-{size}"
                    ProductVariant.objects.create(
                        product=product,
                        sku=sku,
                        size=size,
                        color=color,
                        stock=item['stock'],
                    )
                    variant_count += 1
            self.stdout.write(f'    → Producto: {product.name} ({len(item["colors"])*len(item["sizes"])} variantes)')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Seed completado: {len(catalog_data)} productos, {variant_count} variantes en 3 colecciones.'
        ))

from django.core.management.base import BaseCommand
from catalog.models import Collection, Product, ProductVariant
from django.utils import timezone
import datetime
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seeds the database with test streetwear products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando colecciones (sin borrar existentes)...')

        self.stdout.write('Creando colecciones...')
        now = timezone.now()
        summer_drop = Collection.objects.create(
            name="Summer Drop '26",
            slug="summer-drop-26",
            description="Una colección ligera y fresca para el verano, inspirada en la brisa nocturna urbana.",
            release_date=now - datetime.timedelta(days=5),
            end_date=now + datetime.timedelta(days=30),
        )

        hype_drop = Collection.objects.create(
            name="Midnight Runners HYPE",
            slug="midnight-runners",
            description="Edición extremadamente limitada. Materiales reflectantes y cortes de vanguardia.",
            release_date=now + datetime.timedelta(days=2), # Sale en 2 días (Drop Preview)
            end_date=now + datetime.timedelta(days=5),
        )

        self.stdout.write('Creando productos y variantes...')
        # Producto 1
        p1 = Product.objects.create(
            collection=summer_drop,
            name="Shepherd Oversized Tee - Washed Black",
            slug="oversized-tee-washed-black",
            description="Camiseta 100% algodón de alto gramaje (280gsm). Corte boxy y lavado vintage.",
            base_price=Decimal('45.00'),
            is_active=True
        )
        for size in ['S', 'M', 'L', 'XL']:
            ProductVariant.objects.create(
                product=p1,
                sku=f"SHEP-TEE-BLK-{size}",
                size=size,
                color="Washed Black",
                stock=15 if size in ['M', 'L'] else 5
            )

        # Producto 2
        p2 = Product.objects.create(
            collection=summer_drop,
            name="Cargo Parachute Pants - Olive",
            slug="cargo-parachute-olive",
            description="Pantalones tipo paracaídas con ajuste en tobillo y cintura elástica.",
            base_price=Decimal('85.00'),
            is_active=True
        )
        for size in ['M', 'L', 'XL']:
            ProductVariant.objects.create(
                product=p2,
                sku=f"SHEP-PANT-OLV-{size}",
                size=size,
                color="Olive Green",
                stock=10
            )

        # Producto 3
        p3 = Product.objects.create(
            collection=hype_drop,
            name="Reflective Windbreaker 'Midnight'",
            slug="reflective-windbreaker-midnight",
            description="Cortavientos 3M reflectante completo. Costuras termoselladas.",
            base_price=Decimal('150.00'),
            is_active=True
        )
        for size in ['M', 'L']:
            ProductVariant.objects.create(
                product=p3,
                sku=f"SHEP-WIND-MID-{size}",
                size=size,
                color="3M Silver",
                stock=3
            )

        self.stdout.write(self.style.SUCCESS('¡Base de datos poblada exitosamente!'))

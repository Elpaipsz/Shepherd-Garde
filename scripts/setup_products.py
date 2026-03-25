import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shepherd_garde.settings')
django.setup()

from catalog.models import Collection, Product, ProductVariant
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta

def reset_and_create():
    # Limpiar productos viejos
    Product.objects.all().delete()
    Collection.objects.all().delete()
    print("Limpiados productos y colecciones anteriores.")

    # Colección principal
    essentials = Collection.objects.create(
        name='Shepherd Essentials',
        slug='shepherd-essentials',
        description='Piezas atemporales construidas para durar. Nuestra línea permanente.'
    )

    # Colección Drop (preview)
    drop = Collection.objects.create(
        name='Obsidian Drop 2026',
        slug='obsidian-drop-2026',
        description='Colección limitada inspirada en texturas minerales y arquitectura brutalista.',
        release_date=timezone.now() + timedelta(days=2)
    )

    # Producto 1: Chaqueta Oversized
    p1 = Product.objects.create(
        name='Shadow Shell Jacket',
        slug='shadow-shell-jacket',
        collection=essentials,
        base_price=320.00,
        description='Chaqueta oversized de estilo minimalista en negro carbón mate. Tejido técnico repelente al agua con corte limpio sin costuras visibles. Interior en dorado satinado pálido.',
        is_active=True
    )
    for size in ['S', 'M', 'L', 'XL']:
        ProductVariant.objects.create(
            product=p1,
            sku=f'SSJ-BLK-{size}',
            size=size,
            color='Carbon Black',
            stock=15
        )

    # Producto 2: Pantalón Peregrino
    p2 = Product.objects.create(
        name='Pilgrim Comfort Pant',
        slug='pilgrim-comfort-pant',
        collection=essentials,
        base_price=180.00,
        description='Pantalón de corte relajado en caqui oscuro. Sarga de algodón elástico de alta densidad. Diseño extremadamente limpio con bolsillo oculto en la cintura.',
        is_active=True
    )
    for size in ['S', 'M', 'L', 'XL']:
        ProductVariant.objects.create(
            product=p2,
            sku=f'PCP-KHK-{size}',
            size=size,
            color='Dark Khaki',
            stock=20
        )

    # Producto 3: Camiseta Básica
    p3 = Product.objects.create(
        name='Essential Black Tee',
        slug='essential-black-tee',
        collection=essentials,
        base_price=85.00,
        description='Camiseta negra esencial de corte clásico y calidad premium. Algodón orgánico de gramaje superior con acabado suave y resistente. Minimalismo absoluto.',
        is_active=True
    )
    for size in ['S', 'M', 'L', 'XL']:
        ProductVariant.objects.create(
            product=p3,
            sku=f'EBT-BLK-{size}',
            size=size,
            color='Black',
            stock=25
        )

    print(f"Creados 3 productos con variantes:")
    print(f"  1. {p1.name} (slug: {p1.slug})")
    print(f"  2. {p2.name} (slug: {p2.slug})")
    print(f"  3. {p3.name} (slug: {p3.slug})")

if __name__ == '__main__':
    reset_and_create()

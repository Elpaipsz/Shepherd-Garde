import os
import django
import uuid
from datetime import timedelta
from django.utils import timezone
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shepherd_garde.settings')
django.setup()

from catalog.models import Collection, Product, ProductVariant

def create_demo_data():
    print("Iniciando creación de productos reales para la demo...")

    # 1. Crear Colecciones
    essentials, _ = Collection.objects.get_or_create(
        slug='shepherd-essentials',
        defaults={
            'name': 'Shepherd Essentials',
            'description': 'Piezas atemporales construidas para durar. Nuestra línea permanente.',
            'release_date': None # Activo siempre
        }
    )

    hype_drop, _ = Collection.objects.get_or_create(
        slug='obsidian-drop-2026',
        defaults={
            'name': 'Obsidian Drop 2026',
            'description': 'Colección limitada inspirada en texturas minerales y arquitectura brutalista.',
            'release_date': timezone.now() + timedelta(days=2) # En Preview/Hype
        }
    )

    # 2. Productos y Variantes
    products_data = [
        {
            'name': 'Sculptural Overcoat',
            'collection': essentials,
            'price': 245.00,
            'desc': 'Abrigo de lana pesada con hombros caídos y corte arquitectónico. Resistente al agua y al viento.',
            'variants': [
                {'size': 'S', 'color': 'Alabaster', 'stock': 10},
                {'size': 'M', 'color': 'Alabaster', 'stock': 15},
                {'size': 'L', 'color': 'Alabaster', 'stock': 5},
                {'size': 'M', 'color': 'Obsidian', 'stock': 12},
            ]
        },
        {
            'name': 'Brutalist Knit Sweater',
            'collection': essentials,
            'price': 160.00,
            'desc': 'Suéter de punto grueso con textura rugosa hecha a mano. 100% lana merino orgánica.',
            'variants': [
                {'size': 'M', 'color': 'Bone', 'stock': 20},
                {'size': 'L', 'color': 'Bone', 'stock': 15},
                {'size': 'XL', 'color': 'Bone', 'stock': 8},
            ]
        },
        {
            'name': 'Tactile Lounge Pants',
            'collection': essentials,
            'price': 120.00,
            'desc': 'Pantalones de corte relajado con caída fluida. Cintura elástica invisible y bolsillos ocultos.',
            'variants': [
                {'size': 'S', 'color': 'Dune', 'stock': 15},
                {'size': 'M', 'color': 'Dune', 'stock': 20},
                {'size': 'L', 'color': 'Dune', 'stock': 10},
            ]
        },
        # Obsidian Drop (Solo Preview)
        {
            'name': 'Void-Face Hoodie',
            'collection': hype_drop,
            'price': 185.00,
            'desc': 'Sudadera con capucha sobredimensionada en negro mate profundo. Tejido técnico reflectante.',
            'variants': [
                {'size': 'M', 'color': 'Void', 'stock': 50},
                {'size': 'L', 'color': 'Void', 'stock': 50},
            ]
        }
    ]

    for p_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=slugify(p_data['name']),
            defaults={
                'name': p_data['name'],
                'collection': p_data['collection'],
                'base_price': p_data['price'],
                'description': p_data['desc'],
                'is_active': True
            }
        )
        
        if created:
            print(f"  - Creado producto: {product.name}")
            for v_data in p_data['variants']:
                ProductVariant.objects.create(
                    product=product,
                    sku=f"{product.slug[:10].upper()}-{v_data['color'][:3].upper()}-{v_data['size']}",
                    size=v_data['size'],
                    color=v_data['color'],
                    stock=v_data['stock']
                )
        else:
            print(f"  - Producto ya existe: {product.name}")

    print("¡Proceso completado exitosamente!")

if __name__ == '__main__':
    create_demo_data()

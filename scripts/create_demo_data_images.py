import os
import django
import requests
from django.core.files.base import ContentFile
from datetime import timedelta
from django.utils import timezone
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shepherd_garde.settings')
django.setup()

from catalog.models import Collection, Product, ProductVariant

def download_image(url):
    print(f"Descargando {url}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error descargando la imagen: {e}")
        return None

def create_demo_data():
    print("Iniciando creación de productos reales con imágenes externas para la demo...")

    # 1. Crear Colecciones
    essentials, _ = Collection.objects.get_or_create(
        slug='shepherd-essentials',
        defaults={
            'name': 'Shepherd Essentials',
            'description': 'Piezas atemporales construidas para durar. Nuestra línea permanente.',
            'release_date': None 
        }
    )

    hype_drop, _ = Collection.objects.get_or_create(
        slug='obsidian-drop-2026',
        defaults={
            'name': 'Obsidian Drop 2026',
            'description': 'Colección limitada inspirada en texturas minerales y arquitectura brutalista.',
            'release_date': timezone.now() + timedelta(days=2) 
        }
    )

    # 2. Productos y Variantes
    products_data = [
        {
            'name': 'Sculptural Overcoat',
            'collection': essentials,
            'price': 245.00,
            'desc': 'Abrigo de lana pesada con hombros caídos y corte arquitectónico. Resistente al agua y al viento.',
            'image_url': 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1200&auto=format&fit=crop',
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
            'image_url': 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200&auto=format&fit=crop',
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
            'image_url': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop',
            'variants': [
                {'size': 'S', 'color': 'Dune', 'stock': 15},
                {'size': 'M', 'color': 'Dune', 'stock': 20},
                {'size': 'L', 'color': 'Dune', 'stock': 10},
            ]
        },
        {
            'name': 'Void-Face Hoodie',
            'collection': hype_drop,
            'price': 185.00,
            'desc': 'Sudadera con capucha sobredimensionada en negro mate profundo. Tejido técnico reflectante.',
            'image_url': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop',
            'variants': [
                {'size': 'M', 'color': 'Void', 'stock': 50},
                {'size': 'L', 'color': 'Void', 'stock': 50},
            ]
        }
    ]

    for p_data in products_data:
        # Obtener o crear el producto
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
        
        # Siempre intentamos descargar y asignar la imagen para asegurarnos que la tenga
        if p_data.get('image_url'):
            img_content = download_image(p_data['image_url'])
            if img_content:
                filename = f"{product.slug}.jpg"
                product.main_image.save(filename, ContentFile(img_content), save=True)
                print(f"  - Imagen guardada para: {product.name}")

        if created:
            print(f"  - Creado producto: {product.name}")
            for v_data in p_data['variants']:
                ProductVariant.objects.get_or_create(
                    sku=f"{product.slug[:10].upper()}-{v_data['color'][:3].upper()}-{v_data['size']}",
                    defaults={
                        'product': product,
                        'size': v_data['size'],
                        'color': v_data['color'],
                        'stock': v_data['stock']
                    }
                )
        else:
            print(f"  - Producto ya existe: {product.name}")

    print("¡Proceso completado exitosamente!")

if __name__ == '__main__':
    create_demo_data()

import os
import psycopg2
from django.utils.text import slugify
from decimal import Decimal
import uuid
from catalog.models import Collection, Product, ProductVariant

def sync_admin_core_to_shepherd(logger_func=print):
    logger_func('Iniciando sincronización desde Admin Core...')

    # Configuración de conexión al contenedor de Base de Datos de Admin Core
    # host='localhost' asumiendo que el puerto 5432 está expuesto localmente
    try:
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            database='postgres',
            user='postgres',
            password='postgres'
        )
        cursor = conn.cursor()
        logger_func('Conexión exitosa a la base de datos de Admin Core.')
    except Exception as e:
        logger_func(f'Error al conectar con la base de datos de Admin Core: {e}')
        return False, f'Error al conectar con la base de datos de Admin Core: {e}'

    try:
        # 1. Sincronizar Colecciones
        logger_func('Sincronizando colecciones...')
        cursor.execute("SELECT collection_id, uuid, name, code, description FROM public.collection;")
        admin_core_collections = cursor.fetchall()
        
        collection_map = {} # Maps Admin Core collection_id to Django Collection object
        
        for col_id, col_uuid, col_name, col_code, col_desc in admin_core_collections:
            col_slug = col_code if col_code else slugify(col_name)
            # Limpiar descripción si es JSON vacío '[]'
            description_str = ""
            if col_desc and col_desc != "[]":
                description_str = str(col_desc)
            
            try:
                collection_obj = Collection.objects.get(slug=col_slug)
                collection_obj.name = col_name
                collection_obj.description = description_str
                collection_obj.save()
                logger_func(f"  Colección actualizada: {col_name} ({col_slug})")
            except Collection.DoesNotExist:
                collection_obj = Collection.objects.create(
                    id=col_uuid,
                    name=col_name,
                    slug=col_slug,
                    description=description_str
                )
                logger_func(f"  Colección creada: {col_name} ({col_slug})")
            
            collection_map[col_id] = collection_obj

        # 2. Sincronizar Productos Principales (Visibilidad = True)
        logger_func('Sincronizando productos principales...')
        cursor.execute("""
            SELECT 
                p.product_id, 
                p.uuid, 
                p.sku, 
                p.price, 
                p.status, 
                p.type,
                pd.name, 
                pd.description, 
                pd.url_key,
                pc.collection_id
            FROM public.product p
            LEFT JOIN public.product_description pd ON pd.product_description_product_id = p.product_id
            LEFT JOIN public.product_collection pc ON pc.product_id = p.product_id
            WHERE p.visibility = true;
        """)
        admin_core_products = cursor.fetchall()

        for prod_id, prod_uuid, prod_sku, prod_price, prod_status, prod_type, prod_name, prod_desc, prod_url_key, col_id in admin_core_products:
            if not prod_name:
                continue
            
            # Slugify
            prod_slug = prod_url_key if prod_url_key else slugify(prod_name)
            
            # Colección
            collection_obj = None
            if col_id in collection_map:
                collection_obj = collection_map[col_id]
            else:
                # Asignar a una colección por defecto o crear una si no tiene
                collection_obj = Collection.objects.filter(slug='shepherd-essentials').first()
                if not collection_obj:
                    collection_obj = Collection.objects.create(
                        name='Shepherd Essentials',
                        slug='shepherd-essentials',
                        description='Piezas atemporales construidas para durar. Nuestra línea permanente.'
                    )

            # Limpiar descripción
            desc_str = ""
            if prod_desc and prod_desc != "[]":
                desc_str = str(prod_desc)

            # Obtener la imagen principal de Admin Core (si existe)
            cursor.execute("""
                SELECT origin_image 
                FROM public.product_image 
                WHERE product_image_product_id = %s AND is_main = true 
                LIMIT 1;
            """, (prod_id,))
            img_row = cursor.fetchone()
            image_path = None
            if img_row and img_row[0]:
                # Usamos el path de origen. Django copiará o referenciará.
                image_path = img_row[0]

            # Crear o actualizar Producto en Django
            try:
                product_obj = Product.objects.get(id=prod_uuid)
                product_obj.collection = collection_obj
                product_obj.name = prod_name
                product_obj.slug = prod_slug
                product_obj.description = desc_str
                product_obj.base_price = Decimal(str(prod_price))
                product_obj.is_active = bool(prod_status)
                if image_path:
                    product_obj.main_image = image_path
                product_obj.save()
                logger_func(f"  Producto actualizado: {prod_name} ({prod_slug})")
            except Product.DoesNotExist:
                # Verificar si existe otro producto con el mismo slug para evitar colisión de slug único
                Product.objects.filter(slug=prod_slug).delete()
                
                product_obj = Product.objects.create(
                    id=prod_uuid,
                    collection=collection_obj,
                    name=prod_name,
                    slug=prod_slug,
                    description=desc_str,
                    base_price=Decimal(str(prod_price)),
                    is_active=bool(prod_status),
                    main_image=image_path
                )
                logger_func(f"  Producto creado: {prod_name} ({prod_slug})")

            # 3. Sincronizar Variantes para este Producto
            # En Admin Core, los productos hijos de una variación tienen visibility = false y group_id = prod_id
            cursor.execute("""
                SELECT 
                    p.product_id, 
                    p.uuid, 
                    p.sku, 
                    p.price, 
                    p.status,
                    pi.qty
                FROM public.product p
                LEFT JOIN public.product_inventory pi ON pi.product_inventory_product_id = p.product_id
                WHERE p.visibility = false AND p.group_id = %s;
            """, (prod_id,))
            child_products = cursor.fetchall()

            if not child_products:
                # Es un producto simple (sin variaciones hijas).
                # Creamos una variante por defecto en Django para permitir la compra
                cursor.execute("""
                    SELECT qty FROM public.product_inventory WHERE product_inventory_product_id = %s;
                """, (prod_id,))
                inv_row = cursor.fetchone()
                stock_qty = inv_row[0] if inv_row else 100

                # Obtener talla y color asignados si existen
                cursor.execute("""
                    SELECT attribute_id, option_text 
                    FROM public.product_attribute_value_index 
                    WHERE product_id = %s;
                """, (prod_id,))
                attr_rows = cursor.fetchall()
                
                color_val = "Default"
                size_val = "One Size"
                for attr_id, opt_text in attr_rows:
                    if attr_id == 1: # Color
                        color_val = opt_text
                    elif attr_id == 2: # Size
                        size_val = opt_text

                variant_sku = prod_sku if prod_sku else f"SHEP-{prod_id}-DFLT"
                
                ProductVariant.objects.update_or_create(
                    product=product_obj,
                    sku=variant_sku,
                    defaults={
                        'size': size_val,
                        'color': color_val,
                        'stock': stock_qty,
                        'price_override': None
                    }
                )
                logger_func(f"    Variante simple sincronizada SKU: {variant_sku} (Stock: {stock_qty})")
            else:
                # Tiene variantes hijas reales
                for child_id, child_uuid, child_sku, child_price, child_status, child_qty in child_products:
                    # Obtener atributos talla y color del producto hijo
                    cursor.execute("""
                        SELECT attribute_id, option_text 
                        FROM public.product_attribute_value_index 
                        WHERE product_id = %s;
                    """, (child_id,))
                    attr_rows = cursor.fetchall()
                    
                    color_val = "Default"
                    size_val = "One Size"
                    for attr_id, opt_text in attr_rows:
                        if attr_id == 1: # Color
                            color_val = opt_text
                        elif attr_id == 2: # Size
                            size_val = opt_text

                    stock_qty = child_qty if child_qty is not None else 0
                    price_override = Decimal(str(child_price)) if child_price else None

                    ProductVariant.objects.update_or_create(
                        product=product_obj,
                        sku=child_sku,
                        defaults={
                            'size': size_val,
                            'color': color_val,
                            'stock': stock_qty,
                            'price_override': price_override
                        }
                    )
                    logger_func(f"    Variante hija sincronizada SKU: {child_sku} (Talla: {size_val}, Color: {color_val}, Stock: {stock_qty})")

        logger_func('¡Sincronización finalizada exitosamente!')
        return True, "Sincronización finalizada exitosamente"

    except Exception as e:
        logger_func(f'Error durante la sincronización: {e}')
        return False, f'Error durante la sincronización: {e}'
    finally:
        cursor.close()
        conn.close()

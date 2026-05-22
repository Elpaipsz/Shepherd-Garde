from django.apps import AppConfig
import threading
import time
import os
import sys

class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'catalog'

    def ready(self):
        # Evitar arrancar el daemon si es un comando que no sea runserver (como migrate o sync_admin_core)
        if 'runserver' in sys.argv:
            # Evitar doble ejecución en el proceso de recarga (reloader) de Django
            if os.environ.get('RUN_MAIN') == 'true':
                thread = threading.Thread(target=self.start_auto_sync, daemon=True)
                thread.start()

    def start_auto_sync(self):
        # Esperar 5 segundos a que la base de datos y Django terminen de inicializarse por completo
        time.sleep(5)
        print("[Shepherd Auto-Sync] Iniciando daemon de sincronización en segundo plano...")
        from .sync import sync_admin_core_to_shepherd
        from django.core.cache import cache
        
        while True:
            try:
                # Sincronización silenciosa en segundo plano cada 20 segundos
                success, msg = sync_admin_core_to_shepherd(logger_func=lambda msg: None)
                if success:
                    # Invalidar la caché de catálogo público al sincronizar nuevos productos
                    cache.delete('public_catalog_api_data')
            except Exception as e:
                print(f"[Shepherd Auto-Sync Error] Fallo en la sincronización en segundo plano: {e}")
            time.sleep(20)


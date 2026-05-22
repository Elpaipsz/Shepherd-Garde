import os
from django.core.management.base import BaseCommand
from catalog.sync import sync_admin_core_to_shepherd

class Command(BaseCommand):
    help = 'Synchronizes products and collections from Admin Core database to Shepherd Garde storefront database'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Iniciando sincronización desde Admin Core...'))
        
        # Call the unified sync helper, supplying standard out write
        success, message = sync_admin_core_to_shepherd(logger_func=lambda msg: self.stdout.write(msg))
        
        if success:
            self.stdout.write(self.style.SUCCESS(message))
        else:
            self.stdout.write(self.style.ERROR(message))


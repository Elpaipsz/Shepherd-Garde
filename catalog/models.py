import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class TimeStampedModel(models.Model):
    """Clase base abstracta con campos de auditoría."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Collection(TimeStampedModel):
    """
    Modelo de familia de productos. Soporta catálogo de línea y modelo de Drops (Hype).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    
    # Si release_date es nulo, se considera un Drop inmediato (Catálogo de Línea). 
    # De lo contrario, activará el Hype.
    release_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def is_droppable(self):
        """Retorna True si la colección está configurada como un Drop temporal."""
        return bool(self.release_date or self.end_date)

    def is_active(self):
        """Verifica si la colección ya se lanzó, o si es catálogo siempre disponible."""
        if not self.release_date:
            return True
        return timezone.now() >= self.release_date

    def is_preview(self):
        """Un Drop pre-lanzamiento es visible en la API, pero inactivo para la venta."""
        if not self.release_date:
            return False
        return timezone.now() < self.release_date

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    """Producto general ligado a una Colección (Drop)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    main_image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ProductVariant(TimeStampedModel):
    """
    SKU específico para inventario transaccional (Tallas, Colores).
    Es la entidad donde se aplica el Bloqueo Pesimista en Checkout.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True)
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    stock = models.PositiveIntegerField(default=0)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def decrement_stock_pessimistic(self, quantity):
        """
        Bloqueo transaccional de fila para descontar inventario.
        Debe ser llamado DENTRO de un bloque transaction.atomic() junto con select_for_update().
        """
        if self.stock >= quantity:
            self.stock -= quantity
            self.save(update_fields=['stock', 'updated_at'])
            return True
        return False

    def __str__(self):
        return f"{self.product.name} - {self.size} ({self.color})"


from django.conf import settings

class Review(TimeStampedModel):
    """
    Reseña de producto por usuario autenticado.
    Un usuario solo puede dejar una reseña por producto (unique_together).
    """
    RATING_CHOICES = [(i, i) for i in range(1, 6)]  # 1 a 5 estrellas

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=120, blank=True)
    body = models.TextField(blank=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} — {self.rating}★ by {self.user.email}"

import uuid
from django.db import models
from django.conf import settings
from catalog.models import ProductVariant, TimeStampedModel

class Address(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    alias = models.CharField(max_length=50, help_text="Ej: Casa, Oficina")
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.alias} - {self.user.email}"

class Cart(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    
    def calculate_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

    def __str__(self):
        return f"Cart {self.id} (User: {self.user} | Session: {self.session_id})"

class CartItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_subtotal(self):
        price = self.variant.price_override if self.variant.price_override else self.variant.product.base_price
        return price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.variant.sku} in Cart {self.cart.id}"

class Order(TimeStampedModel):
    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('paid', 'Paid / Confirmed'),
        ('shipped', 'Shipped'),
        ('cancelled', 'Cancelled / Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    ships_to = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='orders_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_intent_id = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"

class OrderItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT) # Protect evita borrar un producto que ya fue vendido
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2) # Snapshot del precio al comprar

    def get_subtotal(self):
        return self.price_at_purchase * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.variant.sku} (Order {self.order.id})"

class Invoice(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    pdf_url = models.URLField(max_length=500)
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for Order {self.order.id}"

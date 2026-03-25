from django.contrib import admin
from .models import Address, Cart, CartItem, Order, OrderItem, Invoice

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('variant', 'quantity', 'price_at_purchase', 'get_subtotal')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'payment_intent_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [OrderItemInline]

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('alias', 'user', 'city', 'country')
    search_fields = ('alias', 'user__email', 'city')

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_id', 'created_at')
    search_fields = ('user__email', 'session_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [CartItemInline]

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'issued_at')
    search_fields = ('order__id',)
    readonly_fields = ('id', 'issued_at')

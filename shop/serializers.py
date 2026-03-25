from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Address
from catalog.serializers import ProductVariantSerializer, ProductSerializer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('id', 'alias', 'address_line', 'city', 'country')
        read_only_fields = ('id',)


class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.DecimalField(source='get_subtotal', max_digits=10, decimal_places=2, read_only=True)
    product = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'variant', 'variant_id', 'quantity', 'subtotal', 'product')

    def get_product(self, obj):
        return {
            'id': str(obj.variant.product.id),
            'name': obj.variant.product.name,
            'slug': obj.variant.product.slug,
            'base_price': str(obj.variant.product.base_price),
            'main_image': obj.variant.product.main_image.url if obj.variant.product.main_image else None,
        }


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(source='calculate_total', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'session_id', 'items', 'total')


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    size = serializers.CharField(source='variant.size', read_only=True)
    color = serializers.CharField(source='variant.color', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    subtotal = serializers.DecimalField(source='get_subtotal', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product_name', 'product_slug', 'size', 'color', 'sku', 'quantity', 'price_at_purchase', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(source='ships_to', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'status', 'total_amount', 'created_at', 'shipping_address', 'items')

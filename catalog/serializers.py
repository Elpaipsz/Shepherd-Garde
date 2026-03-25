from rest_framework import serializers
from .models import Collection, Product, ProductVariant, Review

class CollectionSerializer(serializers.ModelSerializer):
    is_preview = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ('id', 'name', 'slug', 'description', 'release_date', 'end_date', 'is_droppable', 'is_active', 'is_preview')
    
    def get_is_preview(self, obj):
        return obj.is_preview()

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'sku', 'size', 'color', 'stock', 'price_override')

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'rating', 'title', 'body', 'user_name', 'user_email', 'created_at')

class ProductSerializer(serializers.ModelSerializer):
    collection_slug = serializers.CharField(source='collection.slug', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'description', 'base_price', 'main_image', 'is_active', 'collection_slug', 'variants', 'reviews')

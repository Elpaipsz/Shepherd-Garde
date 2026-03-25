from django.contrib import admin
from .models import Collection, Product, ProductVariant

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'release_date', 'end_date', 'is_active_display', 'is_droppable_display')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('release_date', 'end_date')
    search_fields = ('name', 'description')

    def is_active_display(self, obj):
        return obj.is_active()
    is_active_display.boolean = True
    is_active_display.short_description = 'Active'

    def is_droppable_display(self, obj):
        return obj.is_droppable()
    is_droppable_display.boolean = True
    is_droppable_display.short_description = 'Drop/Hype'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'collection', 'base_price', 'is_active')
    list_filter = ('collection', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline]

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('sku', 'product', 'size', 'color', 'stock', 'price_override')
    list_filter = ('product__collection', 'size', 'color')
    search_fields = ('sku', 'product__name')

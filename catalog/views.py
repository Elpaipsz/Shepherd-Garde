from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Collection, Product, Review
from .serializers import CollectionSerializer, ProductSerializer, ReviewSerializer
from django.utils import timezone
from django.db.models import Q

class CollectionListView(generics.ListAPIView):
    serializer_class = CollectionSerializer
    permission_classes = (AllowAny,)
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = Collection.objects.all()
        is_preview = self.request.query_params.get('is_preview')
        
        # Filtrar solo colecciones activas y futuras de hype (según req)
        # Si is_preview = true, incluir todo, de lo contrario solo activas.
        
        if is_preview == 'true':
            # Según doc, retornar solo los que son preview
            return [col for col in queryset if col.is_preview()]
            
        # Filtrado para activas
        return [col for col in queryset if col.is_active()]

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['collection__slug']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related('variants', 'reviews', 'reviews__user')

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reviews(self, request, slug=None):
        from django.utils.translation import gettext_lazy as _
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            if Review.objects.filter(product=product, user=request.user).exists():
                return Response({'error': str(_('Ya has escrito una reseña para este producto.'))}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.core.cache import cache

class PublicCatalogAPIView(generics.GenericAPIView):
    """
    GET /api/public/
    Exposición de catálogo para el equipo asignado (Consumo público JSON).
    Contiene información básica del producto y su inventario.
    """
    permission_classes = (AllowAny,)
    
    def get(self, request):
        cache_key = 'public_catalog_api_data'
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        products = Product.objects.filter(is_active=True).prefetch_related('variants')
        
        data = []
        for p in products:
            variants_data = []
            for v in p.variants.all():
                variants_data.append({
                    "sku": v.sku,
                    "size": v.size,
                    "color": v.color,
                    "stock": v.stock,
                    "price": str(v.price_override) if v.price_override else str(p.base_price)
                })
                
            data.append({
                "id": str(p.id),
                "name": p.name,
                "collection": p.collection.name,
                "base_price": str(p.base_price),
                "variants": variants_data
            })
            
        response_data = {
            "service": "Shepherd Garde Public API",
            "team_id": "Grupo-Shepherd",
            "products": data
        }

        # Cache the response data for 15 minutes (900 seconds)
        cache.set(cache_key, response_data, 60 * 15)
            
        return Response(response_data)


from rest_framework.views import APIView
from .sync import sync_admin_core_to_shepherd

class AdminCoreSyncAPIView(APIView):
    """
    POST /api/v1/catalog/sync/
    Dispara la sincronización manual desde la base de datos del Admin Core hacia Shepherd Garde.
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        logs = []
        def log_capture(msg):
            logs.append(msg)
            
        success, message = sync_admin_core_to_shepherd(logger_func=log_capture)
        if success:
            # Invalidate public catalog cache on successful sync
            cache.delete('public_catalog_api_data')
            return Response({
                "status": "success",
                "message": message,
                "logs": logs
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "status": "error",
                "message": message,
                "logs": logs
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


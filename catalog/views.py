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
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            if Review.objects.filter(product=product, user=request.user).exists():
                return Response({'error': 'Ya has escrito una reseña para este producto.'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

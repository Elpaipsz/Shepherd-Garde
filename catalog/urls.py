from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollectionListView, ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('collections/', CollectionListView.as_view(), name='collection-list'),
    path('', include(router.urls)),
]

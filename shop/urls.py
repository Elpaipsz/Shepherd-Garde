from django.urls import path
from .views import (
    CartView, CartItemView, CartItemDetailView, CartMergeView,
    AddressListCreateView, AddressDetailView,
    OrderListView, CheckoutView, StripeWebhookView
)

urlpatterns = [
    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart-item-list'),
    path('cart/items/<uuid:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('cart/merge/', CartMergeView.as_view(), name='cart-merge'),

    # Checkout (alias corto para el frontend)
    path('checkout/', CheckoutView.as_view(), name='checkout-short'),

    # Addresses
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<uuid:pk>/', AddressDetailView.as_view(), name='address-detail'),

    # Orders
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/webhook/payment-success/', StripeWebhookView.as_view(), name='stripe-webhook'),
]

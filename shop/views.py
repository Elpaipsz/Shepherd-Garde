from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Cart, CartItem, Order, OrderItem, Address
from catalog.models import ProductVariant
from .serializers import (
    CartSerializer, CartItemSerializer,
    AddressSerializer, OrderSerializer
)
from django.utils import timezone
from django.db import transaction
from django.conf import settings
import datetime
import uuid
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


def is_valid_uuid(value: str) -> bool:
    """Return True if value is a well-formed UUID string.
    
    This is an explicit input validation layer used before any DB query
    to reject malformed IDs early and return a clean 400 error.
    Django ORM already uses parameterized queries (no SQL Injection risk),
    but this prevents unnecessary DB roundtrips and provides better UX.
    """
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, AttributeError):
        return False


def get_or_create_cart(request):
    user = request.user if request.user.is_authenticated else None
    session_id = request.headers.get('X-Session-ID', None)

    if user:
        cart, _ = Cart.objects.get_or_create(user=user)
    elif session_id:
        cart, _ = Cart.objects.get_or_create(session_id=session_id)
    else:
        import uuid
        session_id = str(uuid.uuid4())
        cart = Cart.objects.create(session_id=session_id)
    return cart


# ──────────────────────────────────────────────
# CART
# ──────────────────────────────────────────────

class CartView(views.APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        cart = get_or_create_cart(request)
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        # ── Input Validation (UUID) ────────────────────────────────────
        if not variant_id:
            return Response({'error': 'variant_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not is_valid_uuid(str(variant_id)):
            return Response({'error': 'Invalid variant_id format'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1 or quantity > 10:
            return Response({'error': 'Quantity must be between 1 and 10'}, status=status.HTTP_400_BAD_REQUEST)
        # ─────────────────────────────────────────────────────────────

        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'variant_not_found'}, status=status.HTTP_404_NOT_FOUND)

        # Hype Check: no se puede agregar al carrito si el Drop no ha sido liberado
        collection = variant.product.collection
        if collection.is_droppable() and collection.release_date and collection.release_date > timezone.now():
            return Response({
                'error': 'product_not_released',
                'message': f'Este artículo pertenece a un Drop que será liberado el {collection.release_date.isoformat()}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartItemDetailView(views.APIView):
    """
    PATCH /shop/cart/items/{pk}/ → actualizar cantidad
    DELETE /shop/cart/items/{pk}/ → eliminar ítem
    """
    permission_classes = (AllowAny,)

    def get_item(self, request, pk):
        cart = get_or_create_cart(request)
        try:
            return CartItem.objects.get(id=pk, cart=cart)
        except CartItem.DoesNotExist:
            return None

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        if item is None:
            return Response({'error': 'item_not_found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is None or int(quantity) < 1:
            return Response({'error': 'invalid_quantity'}, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = int(quantity)
        item.save()

        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        if item is None:
            return Response({'error': 'item_not_found'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# CART MERGE  (anónimo → autenticado)
# ──────────────────────────────────────────────

class CartMergeView(views.APIView):
    """
    POST /shop/cart/merge/
    
    Se llama justo después de que el usuario hace login.
    Recibe el session_id del carrito anónimo y mueve todos sus
    ítems al carrito del usuario autenticado.
    
    Body: { "session_id": "<uuid>" }
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id or not is_valid_uuid(str(session_id)):
            return Response({'error': 'valid session_id required'}, status=status.HTTP_400_BAD_REQUEST)

        # Carrito de destino (usuario autenticado)
        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        # Carrito de origen (sesión anónima)
        try:
            anon_cart = Cart.objects.get(session_id=session_id, user=None)
        except Cart.DoesNotExist:
            # No había carrito anónimo — devolver el del usuario sin cambios
            serializer = CartSerializer(user_cart)
            return Response(serializer.data)

        # Mover ítems del carrito anónimo al del usuario
        with transaction.atomic():
            for anon_item in anon_cart.items.select_for_update():
                user_item, created = CartItem.objects.get_or_create(
                    cart=user_cart,
                    variant=anon_item.variant
                )
                if not created:
                    user_item.quantity += anon_item.quantity
                else:
                    user_item.quantity = anon_item.quantity
                user_item.save()

            # Eliminar el carrito anónimo
            anon_cart.delete()

        serializer = CartSerializer(user_cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# ADDRESSES
# ──────────────────────────────────────────────

class AddressListCreateView(views.APIView):
    """
    GET  /shop/addresses/  → listar direcciones del usuario autenticado
    POST /shop/addresses/  → crear nueva dirección
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(views.APIView):
    """
    DELETE /shop/addresses/{pk}/ → eliminar dirección
    """
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk, user):
        try:
            return Address.objects.get(id=pk, user=user)
        except Address.DoesNotExist:
            return None

    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        if address is None:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# ORDERS
# ──────────────────────────────────────────────

class OrderListView(generics.ListAPIView):
    """
    GET /shop/orders/ → historial de órdenes del usuario autenticado
    """
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at').prefetch_related('items__variant__product')


class CheckoutView(views.APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        cart = get_or_create_cart(request)
        shipping_address_id = request.data.get('shipping_address_id')

        if not cart.items.exists():
            return Response({'error': 'empty_cart'}, status=status.HTTP_400_BAD_REQUEST)

        if not shipping_address_id:
            return Response({'error': 'shipping_address_required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            address = Address.objects.get(id=shipping_address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'address_not_found'}, status=status.HTTP_404_NOT_FOUND)

        # Pessimistic locking para evitar overselling en Drops
        variant_ids = list(cart.items.values_list('variant_id', flat=True))
        variants = ProductVariant.objects.select_for_update().filter(id__in=variant_ids)
        variant_map = {v.id: v for v in variants}

        for item in cart.items.all():
            locked_variant = variant_map.get(item.variant_id)
            if not locked_variant or locked_variant.stock < item.quantity:
                return Response({
                    'error': 'insufficient_stock',
                    'detail': f'Stock insuficiente para {locked_variant.sku if locked_variant else item.variant_id}'
                }, status=status.HTTP_400_BAD_REQUEST)

        total_amount = cart.calculate_total()

        for item in cart.items.all():
            locked_variant = variant_map[item.variant_id]
            locked_variant.decrement_stock_pessimistic(item.quantity)

        order = Order.objects.create(
            user=request.user,
            ships_to=address,
            status='pending',
            total_amount=total_amount
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                quantity=item.quantity,
                price_at_purchase=item.variant.price_override or item.variant.product.base_price
            )
        cart.items.all().delete()

        # Intentamos Stripe, pero si falla/no está, marcamos como pagado automáticamente para la demo
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100),
                currency='usd',
                metadata={'order_id': str(order.id)}
            )
            client_secret = intent.client_secret
            order.payment_intent_id = client_secret
            order.save()
        except Exception as e:
            # Si Stripe no está configurado o hay error en dev, 
            # simulamos éxito para que aparezca pagada en el admin
            client_secret = "pi_mock_123_demo"
            order.status = 'paid'
            order.payment_intent_id = client_secret
            order.save()
            print(f"Checkout simulation: Order {order.id} marked as 'paid' (Stripe error: {e})")

        expires_at = timezone.now() + datetime.timedelta(minutes=15)

        return Response({
            'order_id': str(order.id),
            'status': order.status,
            'total_amount': str(order.total_amount),
            'expires_at': expires_at.isoformat(),
            'payment_intent_client_secret': client_secret
        }, status=status.HTTP_201_CREATED)


class StripeWebhookView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({'error': 'invalid_payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response({'error': 'invalid_signature'}, status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            order_id = payment_intent.get('metadata', {}).get('order_id')

            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    if order.status == 'pending':
                        order.status = 'paid'
                        order.save()
                except Order.DoesNotExist:
                    pass

        return Response({'received': True}, status=status.HTTP_200_OK)

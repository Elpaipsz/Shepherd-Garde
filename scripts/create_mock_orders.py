import os
import django
import uuid
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shepherd_garde.settings')
django.setup()

from django.contrib.auth import get_user_model
from catalog.models import Product, ProductVariant
from shop.models import Order, OrderItem, Address

User = get_user_model()

def create_mock_data():
    # 1. Get a user
    try:
        user = User.objects.get(email='admin@demo.com')
        print(f"Using user: {user.email}")
    except User.DoesNotExist:
        print("Demo admin user not found. Run admin setup first.")
        return

    # 2. Get a shipping address or create one
    address, _ = Address.objects.get_or_create(
        user=user,
        alias="CASA DEMO",
        defaults={
            'address_line': "Calle Falsa 123",
            'city': "Medellín",
            'country': "Colombia"
        }
    )

    # 3. Get some product variants
    variants = ProductVariant.objects.all()
    if not variants.exists():
        print("No product variants found. Run setup_products.py first.")
        return

    # 4. Create a few orders
    for i in range(2):
        order = Order.objects.create(
            user=user,
            ships_to=address,
            status='paid',
            total_amount=Decimal('0.00'),
            payment_intent_id=f"pi_mock_{uuid.uuid4().hex[:8]}"
        )
        
        # Add 2 items to each order
        total = Decimal('0.00')
        for v in variants[i:i+2]:
            price = v.price_override if v.price_override else v.product.base_price
            OrderItem.objects.create(
                order=order,
                variant=v,
                quantity=1,
                price_at_purchase=price
            )
            total += price
            
        order.total_amount = total
        order.save()
        print(f"Created order: {order.id} for {order.total_amount}")

if __name__ == '__main__':
    create_mock_data()

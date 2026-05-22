import abc
import stripe
from django.conf import settings
from typing import Dict, Any

class PaymentProcessor(abc.ABC):
    """
    Interface for Payment Processors to demonstrate Dependency Injection
    and Ports/Adapters architecture for Entregable 2.
    """
    @abc.abstractmethod
    def process_payment(self, amount: float, order_id: str) -> Dict[str, Any]:
        """
        Processes a payment and returns the result.
        Returns a dict containing at least:
        - 'status': 'paid', 'pending', or 'failed'
        - 'transaction_id': A unique identifier for the transaction
        - 'provider': Name of the processor
        """
        pass


class StripePaymentProcessor(PaymentProcessor):
    """
    Concrete implementation 1: Real Stripe Integration.
    """
    def process_payment(self, amount: float, order_id: str) -> Dict[str, Any]:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),
                currency='usd',
                metadata={'order_id': order_id}
            )
            return {
                'status': 'pending', 
                'transaction_id': intent.client_secret,
                'provider': 'stripe'
            }
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e),
                'provider': 'stripe'
            }


class MockCheckPaymentProcessor(PaymentProcessor):
    """
    Concrete implementation 2: Simulated Check / Bank Transfer payment.
    Used to demonstrate DI and mock testing capabilities.
    """
    def process_payment(self, amount: float, order_id: str) -> Dict[str, Any]:
        # Simulamos un pago que descuenta saldo (Mock) o que genera un cheque
        # Para el entregable, simulamos éxito directo
        transaction_id = f"mock_chk_{order_id}_{int(amount)}"
        return {
            'status': 'paid',
            'transaction_id': transaction_id,
            'provider': 'mock_check'
        }


def get_payment_processor() -> PaymentProcessor:
    """
    Factory function acting as the DI container/resolver.
    In a more complex setup, this could use a library like `dependency_injector`
    or read from Django settings dynamically.
    """
    use_mock = getattr(settings, 'USE_MOCK_PAYMENT', True)
    if use_mock:
        return MockCheckPaymentProcessor()
    return StripePaymentProcessor()

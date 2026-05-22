from django.test import TestCase, override_settings
from shop.payments import get_payment_processor, MockCheckPaymentProcessor, StripePaymentProcessor
from django.contrib.auth import get_user_model

User = get_user_model()

class PaymentProcessorDITests(TestCase):
    
    @override_settings(USE_MOCK_PAYMENT=True)
    def test_get_payment_processor_mock(self):
        """Test DI resolver returns MockCheckPaymentProcessor when USE_MOCK_PAYMENT is True"""
        processor = get_payment_processor()
        self.assertIsInstance(processor, MockCheckPaymentProcessor)

    @override_settings(USE_MOCK_PAYMENT=False)
    def test_get_payment_processor_stripe(self):
        """Test DI resolver returns StripePaymentProcessor when USE_MOCK_PAYMENT is False"""
        processor = get_payment_processor()
        self.assertIsInstance(processor, StripePaymentProcessor)

    def test_mock_payment_processor_process(self):
        """Test the logic of MockCheckPaymentProcessor.process_payment"""
        processor = MockCheckPaymentProcessor()
        
        result = processor.process_payment(amount=100.00, order_id='test-uuid')
        
        self.assertEqual(result['status'], 'paid')
        self.assertEqual(result['transaction_id'], 'mock_chk_test-uuid_100')
        self.assertEqual(result['provider'], 'mock_check')


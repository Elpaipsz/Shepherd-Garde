from rest_framework import generics, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()


class RegisterRateThrottle(AnonRateThrottle):
    """Max 3 registration attempts per minute per IP."""
    scope = 'auth_register'


class RegisterView(views.APIView):
    """
    POST /api/v1/auth/register/
    Creates a new user account and returns JWT tokens immediately,
    so the client can authenticate without a separate login step.
    """
    permission_classes = (AllowAny,)
    throttle_classes = (RegisterRateThrottle,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Issue JWT tokens immediately after registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/auth/profile/ → retrieve authenticated user profile
    PATCH /api/v1/auth/profile/ → update first_name, last_name
    """
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

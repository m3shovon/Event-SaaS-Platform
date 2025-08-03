from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Event, BudgetItem, Guest, Vendor
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    EventSerializer, BudgetItemSerializer, GuestSerializer, VendorSerializer
)

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response({
        'message': 'Registration failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_200_OK)
    return Response({
        'message': 'Login failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# Event Views
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'status']
    search_fields = ['name', 'venue']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

# Budget Views
class BudgetItemListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event', 'category', 'status']
    
    def get_queryset(self):
        return BudgetItem.objects.filter(event__user=self.request.user)

class BudgetItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BudgetItem.objects.filter(event__user=self.request.user)

# Guest Views
class GuestListCreateView(generics.ListCreateAPIView):
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event', 'category', 'rsvp_status', 'checked_in']
    search_fields = ['name', 'email']
    
    def get_queryset(self):
        return Guest.objects.filter(event__user=self.request.user)

class GuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Guest.objects.filter(event__user=self.request.user)

# Vendor Views
class VendorListCreateView(generics.ListCreateAPIView):
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'price_range', 'is_preferred']
    search_fields = ['name', 'services']
    
    def get_queryset(self):
        return Vendor.objects.filter(user=self.request.user)

class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Vendor.objects.filter(user=self.request.user)

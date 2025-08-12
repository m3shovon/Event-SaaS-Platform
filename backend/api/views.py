from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from .models import User, Event, BudgetItem, Guest, Vendor
import urllib.parse
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

# User Profile Views
@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response({
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# WhatsApp Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_whatsapp_group(request):
    event_id = request.data.get('event_id')
    
    if not event_id:
        return Response({
            'message': 'Event ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        event = Event.objects.get(id=event_id, user=request.user)
    except Event.DoesNotExist:
        return Response({
            'message': 'Event not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get all guests with phone numbers for this event
    guests_with_phones = Guest.objects.filter(
        event=event,
        phone__isnull=False
    ).exclude(phone='').values_list('phone', 'name')
    
    if not guests_with_phones:
        return Response({
            'message': 'No guests with phone numbers found for this event'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Format phone numbers for WhatsApp
    phone_numbers = []
    guest_names = []
    
    for phone, name in guests_with_phones:
        # Clean phone number (remove spaces, dashes, etc.)
        clean_phone = ''.join(filter(str.isdigit, phone))
        if clean_phone:
            # Add country code if not present (assuming Bangladesh +880)
            if not clean_phone.startswith('880'):
                clean_phone = '880' + clean_phone.lstrip('0')
            phone_numbers.append(clean_phone)
            guest_names.append(name)
    
    # Create WhatsApp group invite message
    group_name = f"{event.name} - Event Group"
    message = f"Hello! You're invited to join the WhatsApp group for {event.name} on {event.date}. Event details: {event.venue}"
    
    # Create WhatsApp group URL (this opens WhatsApp with pre-filled message)
    # Note: WhatsApp doesn't have a direct API for creating groups, but we can provide instructions
    whatsapp_url = f"https://wa.me/?text={urllib.parse.quote(message)}"
    
    return Response({
        'message': 'WhatsApp group data prepared successfully',
        'group_name': group_name,
        'phone_numbers': phone_numbers,
        'guest_names': guest_names,
        'whatsapp_url': whatsapp_url,
        'total_guests': len(phone_numbers),
        'instructions': 'Create a WhatsApp group manually and add these numbers, or use the WhatsApp Business API for automated group creation.'
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_event_contacts(request, event_id):
    try:
        event = Event.objects.get(id=event_id, user=request.user)
    except Event.DoesNotExist:
        return Response({
            'message': 'Event not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get all guests with contact information
    guests = Guest.objects.filter(event=event).values(
        'id', 'name', 'phone', 'email', 'category', 'rsvp_status'
    )
    
    contacts_with_phone = [guest for guest in guests if guest['phone']]
    contacts_with_email = [guest for guest in guests if guest['email']]
    
    return Response({
        'event': {
            'id': event.id,
            'name': event.name,
            'date': event.date
        },
        'total_guests': len(guests),
        'contacts_with_phone': contacts_with_phone,
        'contacts_with_email': contacts_with_email,
        'phone_count': len(contacts_with_phone),
        'email_count': len(contacts_with_email)
    })


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
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'results': serializer.data,
                'count': queryset.count()
            })
        except Exception as e:
            return Response({
                'message': f'Error fetching events: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate statistics
        stats = queryset.aggregate(
            total_guests=Count('id'),
            total_attendees=Sum('plus_ones') + Count('id'),  # Each guest + their plus ones
            confirmed_guests=Count('id', filter=Q(rsvp_status='confirmed')),
            pending_guests=Count('id', filter=Q(rsvp_status='pending')),
            declined_guests=Count('id', filter=Q(rsvp_status='declined')),
            checked_in_guests=Count('id', filter=Q(checked_in=True)),
        )
        
        # Calculate confirmed attendees (including plus ones)
        confirmed_attendees = queryset.filter(rsvp_status='confirmed').aggregate(
            total=Sum('plus_ones') + Count('id')
        )['total'] or 0
        
        stats['confirmed_attendees'] = confirmed_attendees
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data)
            response_data.data['stats'] = stats
            return response_data

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'stats': stats
        })

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

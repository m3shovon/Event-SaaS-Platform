from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from .models import User, Event, BudgetItem, Guest, Vendor, SubscriptionPlan, UserSubscription, PaymentHistory, UserSettings, PaymentRequest
import urllib.parse
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    EventSerializer, BudgetItemSerializer, GuestSerializer, VendorSerializer, UserProfileSerializer, SubscriptionPlanSerializer, UserSubscriptionSerializer, PaymentHistorySerializer, UserSettingsSerializer,
    PaymentRequestSerializer
)

from django.utils import timezone
from datetime import timedelta


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
    formatted_numbers_list = []
    
    for phone, name in guests_with_phones:
        # Clean phone number (remove spaces, dashes, etc.)
        clean_phone = ''.join(filter(str.isdigit, phone))
        if clean_phone:
            # Add country code if not present (assuming Bangladesh +880)
            if not clean_phone.startswith('880'):
                clean_phone = '880' + clean_phone.lstrip('0')
            
            formatted_number = f"+{clean_phone}"
            phone_numbers.append(clean_phone)
            guest_names.append(name)
            formatted_numbers_list.append(f"{name}: {formatted_number}")
    
    # Create WhatsApp group name
    group_name = f"{event.name} - Event Group"
    
    # Create welcome message for the group
    welcome_message = f"""🎉 Welcome to {event.name}!

📅 Event Date: {event.date}
📍 Venue: {event.venue}

This group is created for event coordination and updates. Please feel free to ask any questions about the event.

Looking forward to seeing everyone there! 🎊"""
    
    # Create WhatsApp group creation URL
    # This will open WhatsApp with a pre-filled message to create a group
    encoded_message = urllib.parse.quote(welcome_message)
    
    # For WhatsApp group creation, we'll create a URL that opens WhatsApp with the message
    # The user will need to manually create the group and add the numbers
    whatsapp_group_url = f"https://wa.me/?text={encoded_message}"
    
    # Create a formatted list of phone numbers for easy copying
    formatted_numbers_text = "\n".join(formatted_numbers_list)
    
    # Create individual WhatsApp links for each contact
    individual_links = []
    for i, (phone, name) in enumerate(zip(phone_numbers, guest_names)):
        individual_message = f"Hi {name}! You're invited to join our WhatsApp group for {event.name} on {event.date}. Please click this link to join: [GROUP_LINK_HERE]"
        encoded_individual_message = urllib.parse.quote(individual_message)
        individual_link = f"https://wa.me/{phone}?text={encoded_individual_message}"
        individual_links.append({
            'name': name,
            'phone': f"+{phone}",
            'link': individual_link
        })
    
    return Response({
        'message': 'WhatsApp group data prepared successfully',
        'group_name': group_name,
        'phone_numbers': phone_numbers,
        'guest_names': guest_names,
        'formatted_numbers': formatted_numbers_text,
        'welcome_message': welcome_message,
        'whatsapp_group_url': whatsapp_group_url,
        'individual_links': individual_links,
        'total_guests': len(phone_numbers),
        'instructions': [
            "1. Click 'Open WhatsApp' to open WhatsApp with welcome message",
            "2. Create a new group with the event name",
            "3. Copy the phone numbers and add them to the group",
            "4. Send the welcome message to the group",
            "5. Alternatively, use individual links to invite guests one by one"
        ]
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


# Settings Views
@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_settings(request):
    settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Settings updated successfully',
                'settings': serializer.data
            })
        return Response({
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# Billing Views
@api_view(['GET'])
@permission_classes([AllowAny])
def subscription_plans(request):
    plans = SubscriptionPlan.objects.filter(is_active=True)
    serializer = SubscriptionPlanSerializer(plans, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_subscription(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)
    except UserSubscription.DoesNotExist:
        return Response({
            'message': 'No active subscription found',
            'subscription': None
        })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_request(request):
    plan_id = request.data.get('plan_id')
    billing_cycle = request.data.get('billing_cycle', 'monthly')
    payment_method = request.data.get('payment_method')
    transaction_id = request.data.get('transaction_id', '')
    payment_proof = request.data.get('payment_proof', '')
    notes = request.data.get('notes', '')
    
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
    except SubscriptionPlan.DoesNotExist:
        return Response({
            'message': 'Invalid subscription plan'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate price based on billing cycle
    amount = plan.price_monthly if billing_cycle == 'monthly' else plan.price_yearly
    
    # Create payment request
    payment_request = PaymentRequest.objects.create(
        user=request.user,
        plan=plan,
        billing_cycle=billing_cycle,
        amount=amount,
        payment_method=payment_method,
        transaction_id=transaction_id,
        payment_proof=payment_proof,
        notes=notes,
        status='submitted',
        submitted_at=timezone.now()
    )
    
    return Response({
        'message': 'Payment request submitted successfully. We will verify your payment and activate your subscription within 24 hours.',
        'payment_request': PaymentRequestSerializer(payment_request).data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_requests(request):
    requests = PaymentRequest.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_subscription(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        subscription.status = 'cancelled'
        subscription.save()
        
        # Update user subscription plan to free
        request.user.subscription_plan = 'free'
        request.user.save()
        
        return Response({
            'message': 'Subscription cancelled successfully'
        })
        
    except UserSubscription.DoesNotExist:
        return Response({
            'message': 'No active subscription found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_history(request):
    payments = PaymentHistory.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentHistorySerializer(payments, many=True)
    return Response(serializer.data)

# Admin Views for Payment Management
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_payment_requests(request):
    requests = PaymentRequest.objects.all().order_by('-created_at')
    serializer = PaymentRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_payment_request(request, request_id):
    try:
        payment_request = PaymentRequest.objects.get(id=request_id)
        admin_notes = request.data.get('admin_notes', '')
        
        # Update payment request status
        payment_request.status = 'approved'
        payment_request.admin_notes = admin_notes
        payment_request.verified_at = timezone.now()
        payment_request.save()
        
        # Calculate subscription period
        start_date = timezone.now()
        if payment_request.billing_cycle == 'monthly':
            end_date = start_date + timedelta(days=30)
        else:
            end_date = start_date + timedelta(days=365)
        
        # Create or update subscription
        subscription, created = UserSubscription.objects.get_or_create(
            user=payment_request.user,
            defaults={
                'plan': payment_request.plan,
                'billing_cycle': payment_request.billing_cycle,
                'status': 'active',
                'current_period_start': start_date,
                'current_period_end': end_date,
            }
        )
        
        if not created:
            subscription.plan = payment_request.plan
            subscription.billing_cycle = payment_request.billing_cycle
            subscription.status = 'active'
            subscription.current_period_start = start_date
            subscription.current_period_end = end_date
            subscription.save()
        
        # Update user subscription plan
        payment_request.user.subscription_plan = payment_request.plan.name
        payment_request.user.save()
        
        # Create payment history record
        PaymentHistory.objects.create(
            user=payment_request.user,
            subscription=subscription,
            payment_request=payment_request,
            amount=payment_request.amount,
            status='completed',
            payment_method=payment_request.payment_method,
            transaction_id=payment_request.transaction_id
        )
        
        return Response({
            'message': 'Payment approved and subscription activated',
            'subscription': UserSubscriptionSerializer(subscription).data
        })
        
    except PaymentRequest.DoesNotExist:
        return Response({
            'message': 'Payment request not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reject_payment_request(request, request_id):
    try:
        payment_request = PaymentRequest.objects.get(id=request_id)
        admin_notes = request.data.get('admin_notes', '')
        
        payment_request.status = 'rejected'
        payment_request.admin_notes = admin_notes
        payment_request.verified_at = timezone.now()
        payment_request.save()
        
        return Response({
            'message': 'Payment request rejected'
        })
        
    except PaymentRequest.DoesNotExist:
        return Response({
            'message': 'Payment request not found'
        }, status=status.HTTP_404_NOT_FOUND)
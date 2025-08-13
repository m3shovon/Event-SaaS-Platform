from django.urls import path
from . import views, analytics

urlpatterns = [
    # Authentication
    path('auth/signup/', views.signup, name='signup'),
    path('auth/signin/', views.signin, name='signin'),
    path('auth/profile/', views.user_profile, name='user-profile'),
    
    # Events
    path('events/', views.EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    
    # Budget
    path('budget/', views.BudgetItemListCreateView.as_view(), name='budget-list-create'),
    path('budget/<int:pk>/', views.BudgetItemDetailView.as_view(), name='budget-detail'),
    
    # Guests
    path('guests/', views.GuestListCreateView.as_view(), name='guest-list-create'),
    path('guests/<int:pk>/', views.GuestDetailView.as_view(), name='guest-detail'),
    
    # Vendors
    path('vendors/', views.VendorListCreateView.as_view(), name='vendor-list-create'),
    path('vendors/<int:pk>/', views.VendorDetailView.as_view(), name='vendor-detail'),

    path('analytics/event/<int:event_id>/', analytics.event_analytics, name='event-analytics'),
    path('analytics/overall/', analytics.overall_analytics, name='overall-analytics'),

    # WhatsApp
    path('whatsapp/create-group/', views.create_whatsapp_group, name='create-whatsapp-group'),
    path('whatsapp/contacts/<int:event_id>/', views.get_event_contacts, name='get-event-contacts'),


    path('settings/', views.user_settings, name='user-settings'),
    
    # Billing & Subscriptions
    path('billing/plans/', views.subscription_plans, name='subscription_plans'),
    path('billing/subscription/', views.user_subscription, name='user_subscription'),
    path('billing/request/', views.create_payment_request, name='create_payment_request'),
    path('billing/requests/', views.payment_requests, name='payment_requests'),
    path('billing/cancel/', views.cancel_subscription, name='cancel_subscription'),
    path('billing/history/', views.payment_history, name='payment_history'),
    
    # Admin billing URLs
    path('admin/payments/', views.admin_payment_requests, name='admin_payment_requests'),
    path('admin/payments/<int:request_id>/approve/', views.approve_payment_request, name='approve_payment_request'),
    path('admin/payments/<int:request_id>/reject/', views.reject_payment_request, name='reject_payment_request'),




]

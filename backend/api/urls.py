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
]

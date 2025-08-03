from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Event, BudgetItem, Guest, Vendor

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'business_name', 'subscription_plan', 'is_verified', 'created_at')
    list_filter = ('subscription_plan', 'business_type', 'is_verified', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'business_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Business Information', {
            'fields': ('business_name', 'business_type', 'phone', 'country', 'city')
        }),
        ('Subscription', {
            'fields': ('subscription_plan', 'is_verified', 'subscribe_newsletter')
        }),
    )

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'date', 'status', 'budget', 'expected_guests', 'created_at')
    list_filter = ('category', 'status', 'date', 'created_at')
    search_fields = ('name', 'venue', 'user__email')
    ordering = ('-created_at',)
    date_hierarchy = 'date'

@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'event', 'category', 'estimated_cost', 'actual_cost', 'status', 'due_date')
    list_filter = ('category', 'status', 'due_date', 'created_at')
    search_fields = ('item_name', 'event__name', 'vendor')
    ordering = ('-created_at',)

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'event', 'category', 'rsvp_status', 'plus_ones', 'invitation_sent', 'checked_in')
    list_filter = ('category', 'rsvp_status', 'invitation_sent', 'checked_in', 'created_at')
    search_fields = ('name', 'email', 'event__name')
    ordering = ('-created_at',)

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'rating', 'price_range', 'is_preferred', 'created_at')
    list_filter = ('category', 'price_range', 'is_preferred', 'created_at')
    search_fields = ('name', 'services', 'user__email')
    ordering = ('-created_at',)

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# User Model
class User(AbstractUser):
    SUBSCRIPTION_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    
    BUSINESS_TYPE_CHOICES = [
        ('Wedding Planner', 'Wedding Planner'),
        ('Event Management Company', 'Event Management Company'),
        ('Community Organization', 'Community Organization'),
        ('Corporate Event Planner', 'Corporate Event Planner'),
        ('Individual Planner', 'Individual Planner'),
        ('Other', 'Other'),
    ]
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    business_name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPE_CHOICES)
    country = models.CharField(max_length=100, default='Bangladesh')
    city = models.CharField(max_length=100)
    subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_CHOICES, default='free')
    is_verified = models.BooleanField(default=False)
    subscribe_newsletter = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = 'auth_user'

# Event Model
class Event(models.Model):
    CATEGORY_CHOICES = [
        ('wedding', 'Wedding'),
        ('corporate', 'Corporate Event'),
        ('community', 'Community Event'),
        ('social', 'Social Event'),
        ('birthday', 'Birthday Party'),
        ('anniversary', 'Anniversary'),
        ('conference', 'Conference'),
        ('seminar', 'Seminar'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    venue = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    expected_guests = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    special_requirements = models.TextField(blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.date}"

# Budget Model
class BudgetItem(models.Model):
    CATEGORY_CHOICES = [
        ('venue', 'Venue'),
        ('catering', 'Catering'),
        ('decoration', 'Decoration'),
        ('photography', 'Photography'),
        ('entertainment', 'Entertainment'),
        ('transportation', 'Transportation'),
        ('flowers', 'Flowers'),
        ('invitations', 'Invitations'),
        ('gifts', 'Gifts'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partial', 'Partially Paid'),
        ('overdue', 'Overdue'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='budget_items')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    item_name = models.CharField(max_length=200)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vendor = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date', 'category']
    
    def __str__(self):
        return f"{self.item_name} - {self.event.name}"

# Guest Model
class Guest(models.Model):
    CATEGORY_CHOICES = [
        ('family', 'Family'),
        ('friends', 'Friends'),
        ('colleagues', 'Colleagues'),
        ('vip', 'VIP'),
        ('vendors', 'Vendors'),
        ('other', 'Other'),
    ]
    
    RSVP_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('maybe', 'Maybe'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='guests')
    name = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    rsvp_status = models.CharField(max_length=20, choices=RSVP_CHOICES, default='pending')
    plus_ones = models.PositiveIntegerField(default=0)
    dietary_restrictions = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    invitation_sent = models.BooleanField(default=False)
    invitation_sent_date = models.DateTimeField(null=True, blank=True)
    checked_in = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.event.name}"
    
    @property
    def total_attendees(self):
        """Returns total attendees for this guest (guest + plus ones)"""
        return 1 + self.plus_ones

# Vendor Model
class Vendor(models.Model):
    CATEGORY_CHOICES = [
        ('catering', 'Catering'),
        ('photography', 'Photography'),
        ('decoration', 'Decoration'),
        ('entertainment', 'Entertainment'),
        ('venue', 'Venue'),
        ('transportation', 'Transportation'),
        ('flowers', 'Flowers'),
        ('makeup', 'Makeup & Beauty'),
        ('sound', 'Sound & Lighting'),
        ('security', 'Security'),
        ('other', 'Other'),
    ]
    
    PRICE_RANGE_CHOICES = [
        ('budget', 'Budget (৳)'),
        ('mid_range', 'Mid Range (৳৳)'),
        ('premium', 'Premium (৳৳৳)'),
        ('luxury', 'Luxury (৳৳৳৳)'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vendors')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    website = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    price_range = models.CharField(max_length=20, choices=PRICE_RANGE_CHOICES)
    services = models.TextField()
    notes = models.TextField(blank=True)
    is_preferred = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.category}"

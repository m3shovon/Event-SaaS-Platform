from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Event, BudgetItem, Guest, Vendor
from datetime import datetime, timedelta
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_analytics(request, event_id):
    """Get comprehensive analytics for a specific event"""
    try:
        event = Event.objects.get(id=event_id, user=request.user)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)
    
    # Budget Analytics
    budget_items = BudgetItem.objects.filter(event=event)
    budget_stats = budget_items.aggregate(
        total_estimated=Sum('estimated_cost'),
        total_actual=Sum('actual_cost'),
        total_items=Count('id'),
        paid_items=Count('id', filter=Q(status='paid')),
        pending_items=Count('id', filter=Q(status='pending')),
        overdue_items=Count('id', filter=Q(status='overdue'))
    )
    
    # Handle None values
    budget_stats['total_estimated'] = budget_stats['total_estimated'] or 0
    budget_stats['total_actual'] = budget_stats['total_actual'] or 0
    
    # Budget by category
    budget_by_category = budget_items.values('category').annotate(
        estimated=Sum('estimated_cost'),
        actual=Sum('actual_cost'),
        count=Count('id')
    ).order_by('-estimated')
    
    # Guest Analytics
    guests = Guest.objects.filter(event=event)
    guest_stats = guests.aggregate(
        total_guests=Count('id'),
        total_attendees=Sum(F('plus_ones') + 1),
        confirmed_guests=Count('id', filter=Q(rsvp_status='confirmed')),
        confirmed_attendees=Sum(F('plus_ones') + 1, filter=Q(rsvp_status='confirmed')),
        pending_guests=Count('id', filter=Q(rsvp_status='pending')),
        declined_guests=Count('id', filter=Q(rsvp_status='declined')),
        checked_in_guests=Count('id', filter=Q(checked_in=True)),
        checked_in_attendees=Sum(F('plus_ones') + 1, filter=Q(checked_in=True))
    )
    
    # Handle None values for guests
    for key in guest_stats:
        guest_stats[key] = guest_stats[key] or 0
    
    # Guest by category
    guest_by_category = guests.values('category').annotate(
        count=Count('id'),
        attendees=Sum(F('plus_ones') + 1),
        confirmed=Count('id', filter=Q(rsvp_status='confirmed'))
    ).order_by('-count')
    
    # Vendor Analytics (user's vendors, not event-specific)
    user_vendors = Vendor.objects.filter(user=request.user)
    vendor_stats = user_vendors.aggregate(
        total_vendors=Count('id'),
        avg_rating=Avg('rating'),
        preferred_vendors=Count('id', filter=Q(is_preferred=True))
    )
    
    # Handle None values for vendors
    vendor_stats['avg_rating'] = vendor_stats['avg_rating'] or 0
    
    # Vendor by category
    vendor_by_category = user_vendors.values('category').annotate(
        count=Count('id'),
        avg_rating=Avg('rating')
    ).order_by('-count')
    
    # Timeline data (for charts)
    # budget_timeline = budget_items.extra(
    #     select={'month': "DATE_TRUNC('month', created_at)"}
    # ).values('month').annotate(
    #     amount=Sum('actual_cost'),
    #     count=Count('id')
    # ).order_by('month')
    
    # guest_timeline = guests.extra(
    #     select={'month': "DATE_TRUNC('month', created_at)"}
    # ).values('month').annotate(
    #     count=Count('id'),
    #     attendees=Sum(F('plus_ones') + 1)
    # ).order_by('month')

    # Budget timeline
    budget_timeline = budget_items.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        amount=Sum('actual_cost'),
        count=Count('id')
    ).order_by('month')

    # Guest timeline
    guest_timeline = guests.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        count=Count('id'),
        attendees=Sum(F('plus_ones') + 1)
    ).order_by('month')

    
    # Event progress
    days_until_event = (event.date - timezone.now().date()).days
    event_progress = {
        'days_until_event': days_until_event,
        'is_past_event': days_until_event < 0,
        'planning_progress': min(100, max(0, (100 - days_until_event * 2))) if days_until_event > 0 else 100
    }
    
    return Response({
        'event': {
            'id': event.id,
            'name': event.name,
            'date': event.date,
            'status': event.status,
            'category': event.category,
            'budget': float(event.budget),
            'expected_guests': event.expected_guests
        },
        'budget': {
            'stats': budget_stats,
            'by_category': list(budget_by_category),
            'timeline': list(budget_timeline),
            'budget_utilization': (float(budget_stats['total_actual']) / float(event.budget)) * 100 if event.budget > 0 else 0,
            'variance': float(budget_stats['total_actual']) - float(budget_stats['total_estimated'])
        },
        'guests': {
            'stats': guest_stats,
            'by_category': list(guest_by_category),
            'timeline': list(guest_timeline),
            'rsvp_rate': (guest_stats['confirmed_guests'] / guest_stats['total_guests'] * 100) if guest_stats['total_guests'] > 0 else 0,
            'attendance_rate': (guest_stats['checked_in_guests'] / guest_stats['confirmed_guests'] * 100) if guest_stats['confirmed_guests'] > 0 else 0
        },
        'vendors': {
            'stats': vendor_stats,
            'by_category': list(vendor_by_category)
        },
        'progress': event_progress,
        'generated_at': timezone.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overall_analytics(request):
    """Get overall analytics across all user events"""
    user_events = Event.objects.filter(user=request.user)
    
    # Overall stats
    overall_stats = {
        'total_events': user_events.count(),
        'active_events': user_events.filter(status__in=['planning', 'confirmed', 'active']).count(),
        'completed_events': user_events.filter(status='completed').count(),
        'total_budget': float(user_events.aggregate(Sum('budget'))['budget__sum'] or 0),
        'total_expected_guests': user_events.aggregate(Sum('expected_guests'))['expected_guests__sum'] or 0
    }
    
    # Events by category
    events_by_category = user_events.values('category').annotate(
        count=Count('id'),
        total_budget=Sum('budget')
    ).order_by('-count')
    
    # Events by status
    events_by_status = user_events.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Monthly event creation trend - using TruncMonth for cross-database compatibility
    monthly_events = user_events.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    # Recent events
    recent_events = user_events.order_by('-created_at')[:5].values(
        'id', 'name', 'date', 'status', 'category', 'budget'
    )
    
    return Response({
        'overall_stats': overall_stats,
        'events_by_category': list(events_by_category),
        'events_by_status': list(events_by_status),
        'monthly_trend': list(monthly_events),
        'recent_events': list(recent_events),
        'generated_at': timezone.now().isoformat()
    })

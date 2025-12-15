from django.db import models

from users.models import User

class Scholar(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='scholar_profile')
    level = models.CharField(max_length=50, blank=True)
    required_hours_per_month = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# ---------- Activity Categories ----------
class ActivityCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# ---------- Activities ----------
class Activity(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    scholar = models.ForeignKey(Scholar, on_delete=models.CASCADE, related_name='activities')
    category = models.ForeignKey(ActivityCategory, null=True, blank=True, on_delete=models.SET_NULL)
    description = models.TextField()
    hours = models.FloatField()
    activity_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_activities')
    review_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

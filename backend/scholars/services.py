from .models import User, Scholar, Activity, ActivityCategory
from django.db.models import Sum, Count
from datetime import datetime

class Storage:
    # --- User ---
    def get_user(self, id):
        return User.objects.filter(id=id).first()

    def upsert_user(self, **kwargs):
        obj, _ = User.objects.update_or_create(id=kwargs.get("id"), defaults=kwargs)
        return obj

    # --- Scholar ---
    def get_scholar_by_user(self, user_id):
        return Scholar.objects.filter(user_id=user_id).first()

    def get_scholar_with_user(self, scholar_id):
        return Scholar.objects.select_related('user').filter(id=scholar_id).first()

    def get_all_scholars_with_users(self):
        return Scholar.objects.select_related('user').all().order_by('user__first_name', 'user__last_name')

    def create_scholar(self, **kwargs):
        return Scholar.objects.create(**kwargs)

    def update_scholar(self, scholar_id, **kwargs):
        Scholar.objects.filter(id=scholar_id).update(**kwargs)
        return Scholar.objects.get(id=scholar_id)

    # --- Activity ---
    def create_activity(self, **kwargs):
        return Activity.objects.create(**kwargs)

    def get_activity_by_id(self, id):
        return Activity.objects.filter(id=id).first()

    def get_activities_by_scholar(self, scholar_id):
        return Activity.objects.filter(scholar_id=scholar_id).order_by('-activity_date')

    def update_activity_status(self, activity_id, status, reviewed_by_id, review_comment=None):
        Activity.objects.filter(id=activity_id).update(
            status=status,
            reviewed_by_id=reviewed_by_id,
            review_comment=review_comment,
            reviewed_at=datetime.now()
        )
        return Activity.objects.get(id=activity_id)

    # --- Categories ---
    def get_all_categories(self):
        return ActivityCategory.objects.all().order_by('name')

    def create_category(self, **kwargs):
        return ActivityCategory.objects.create(**kwargs)

    # --- Stats ---
    def get_scholar_stats(self, scholar_id):
        activities = Activity.objects.filter(scholar_id=scholar_id)
        total_hours = activities.filter(status='approved').aggregate(Sum('hours'))['hours__sum'] or 0
        pending_activities = activities.filter(status='pending').count()
        approved_activities = activities.filter(status='approved').count()
        rejected_activities = activities.filter(status='rejected').count()
        current_month = datetime.now().month
        current_month_hours = activities.filter(status='approved', activity_date__month=current_month).aggregate(Sum('hours'))['hours__sum'] or 0

        return {
            'scholar_id': scholar_id,
            'total_hours': total_hours,
            'current_month_hours': current_month_hours,
            'pending_activities': pending_activities,
            'approved_activities': approved_activities,
            'rejected_activities': rejected_activities,
        }

    def get_dashboard_stats(self):
        total_scholars = Scholar.objects.count()
        month_activities = Activity.objects.filter(activity_date__month=datetime.now().month)
        active_this_month = month_activities.values('scholar_id').distinct().count()
        pending_approvals = month_activities.filter(status='pending').count()
        hours_this_month = month_activities.filter(status='approved').aggregate(Sum('hours'))['hours__sum'] or 0
        return {
            'total_scholars': total_scholars,
            'active_this_month': active_this_month,
            'pending_approvals': pending_approvals,
            'hours_this_month': hours_this_month
        }

    @staticmethod    
    def get_activities_with_details():
        """
        Returns all activities with related scholar, user, category, and reviewer info
        """
        activities = Activity.objects.select_related(
            'scholar__user', 'category', 'reviewed_by'
        ).all().order_by('-created_at')

        result = []
        for activity in activities:
            result.append({
                "id": activity.id,
                "description": activity.description,
                "hours": activity.hours,
                "activity_date": activity.activity_date,
                "status": activity.status,
                "review_comment": activity.review_comment,
                "scholar": {
                    "id": activity.scholar.id,
                    "level": activity.scholar.level,
                    "required_hours_per_month": activity.scholar.required_hours_per_month,
                    "user": {
                        "id": activity.scholar.user.id,
                        "username": activity.scholar.user.username,
                        "email": activity.scholar.user.email,
                        "role": activity.scholar.user.role
                    }
                },
                "category": {
                    "id": activity.category.id if activity.category else None,
                    "name": activity.category.name if activity.category else None
                } if activity.category else None,
                "reviewer": {
                    "id": activity.reviewed_by.id,
                    "username": activity.reviewed_by.username
                } if activity.reviewed_by else None
            })
        return result

storage = Storage()

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ADMIN = 'admin'
    SCHOLAR = 'scholar'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (SCHOLAR, 'Scholar'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=SCHOLAR
    )

    def is_admin(self):
        return self.role == self.ADMIN

    def is_scholar(self):
        return self.role == self.SCHOLAR

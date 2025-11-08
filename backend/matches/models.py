from django.db import models
from fixtures.models import Fixture

class Match(models.Model):
    fixture = models.OneToOneField(Fixture, on_delete=models.CASCADE)
    court_number = models.IntegerField()
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('UPCOMING', 'Upcoming'),
        ('LIVE', 'Live'),
        ('COMPLETED', 'Completed'),
    ])
    winner = models.ForeignKey('players.Player', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Court {self.court_number} - {self.scheduled_time.strftime('%Y-%m-%d %H:%M')}"

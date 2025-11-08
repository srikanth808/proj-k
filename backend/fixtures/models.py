from django.db import models
from players.models import Player

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('UPCOMING', 'Upcoming'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
    ])
    
    def __str__(self):
        return self.name

class Fixture(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round_number = models.IntegerField()
    match_number = models.IntegerField()
    player1 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='fixtures_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='fixtures_as_player2')
    bye = models.BooleanField(default=False)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='fixtures_won')
    score = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        unique_together = ['tournament', 'round_number', 'match_number']
        
    def __str__(self):
        return f"Round {self.round_number} - Match {self.match_number}"

from django.db import models
from matches.models import Match

class Game(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    game_number = models.IntegerField()
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    winner = models.ForeignKey('players.Player', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['match', 'game_number']
    
    def __str__(self):
        return f"{self.match} - Game {self.game_number}"

class Point(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    scored_by = models.ForeignKey('players.Player', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Point by {self.scored_by} at {self.timestamp.strftime('%H:%M:%S')}"

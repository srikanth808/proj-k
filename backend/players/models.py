from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Player(models.Model):
    name = models.CharField(max_length=100, unique=True)
    age = models.IntegerField(validators=[MinValueValidator(8), MaxValueValidator(100)])
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    ranking = models.IntegerField(default=0, help_text="Player ranking points")

    CATEGORY_CHOICES = [
        ('MS', 'Men Singles'),
        ('WS', 'Women Singles'),
        ('MD', 'Men Doubles'),
        ('WD', 'Women Doubles'),
        ('XD', 'Mixed Doubles'),
    ]
    category = models.CharField(max_length=2, choices=CATEGORY_CHOICES, default='MS')

    # Performance stats
    total_matches = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # Tournament participation
    tournaments_played = models.IntegerField(default=0)
    best_finish = models.CharField(max_length=20, blank=True, null=True)  # e.g., "Champion", "Finalist"

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-ranking', 'name']
        indexes = [
            models.Index(fields=['category', 'ranking']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()}) - Rank: {self.ranking}"

    def update_stats(self):
        """Update win rate and other calculated fields"""
        if self.total_matches > 0:
            self.win_rate = round((self.wins / self.total_matches) * 100, 2)
        else:
            self.win_rate = 0.00
        self.save()

    @property
    def win_percentage(self):
        """Return win percentage as a formatted string"""
        return f"{self.win_rate}%"

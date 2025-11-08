from rest_framework import serializers
from rest_framework import serializers
from .models import Player

class PlayerSerializer(serializers.ModelSerializer):
    def validate_email(self, value):
        """
        Check that the email is unique.
        """
        if Player.objects.filter(email=value).exists():
            raise serializers.ValidationError("A player with this email already exists.")
        return value
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    win_percentage = serializers.CharField(read_only=True)

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'age', 'email', 'phone', 'country', 'ranking',
            'category', 'category_display', 'total_matches', 'wins', 'losses',
            'win_rate', 'win_percentage', 'tournaments_played', 'best_finish',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'win_rate', 'win_percentage', 'created_at', 'updated_at']

    def create(self, validated_data):
        player = super().create(validated_data)
        player.update_stats()  # Initialize stats
        return player

    def update(self, instance, validated_data):
        player = super().update(instance, validated_data)
        player.update_stats()  # Update stats after changes
        return player

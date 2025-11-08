from rest_framework import serializers
from .models import Match
from fixtures.serializers import FixtureSerializer

class MatchSerializer(serializers.ModelSerializer):
    fixture = FixtureSerializer(read_only=True)
    fixture_details = FixtureSerializer(source='fixture', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'fixture', 'fixture_details', 'court_number',
                 'scheduled_time', 'status', 'winner']

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Tournament, Fixture
from players.models import Player
from datetime import datetime, timedelta
import json

class FixtureTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=7)).date()
        )
        
        # Create test players
        self.player1 = Player.objects.create(
            name="Player 1",
            age=25,
            email="player1@test.com",
            phone="1234567890",
            category="MS"
        )
        self.player2 = Player.objects.create(
            name="Player 2",
            age=26,
            email="player2@test.com",
            phone="1234567891",
            category="MS"
        )

    def test_create_tournament(self):
        """Test creating a new tournament"""
        url = reverse('tournament-list')
        data = {
            'name': 'New Tournament',
            'start_date': datetime.now().date().isoformat(),
            'end_date': (datetime.now() + timedelta(days=7)).date().isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tournament.objects.count(), 2)

    def test_create_tournament_invalid_dates(self):
        """Test creating a tournament with invalid dates"""
        url = reverse('tournament-list')
        data = {
            'name': 'Invalid Tournament',
            'start_date': (datetime.now() + timedelta(days=7)).date().isoformat(),
            'end_date': datetime.now().date().isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generate_fixtures(self):
        """Test generating fixtures for a tournament"""
        url = reverse('generate-fixtures', kwargs={'tournament_id': self.tournament.id})
        data = {
            'player_ids': [self.player1.id, self.player2.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Fixture.objects.exists())

    def test_get_tournament_fixtures(self):
        """Test retrieving fixtures for a tournament"""
        # Create a fixture first
        fixture = Fixture.objects.create(
            tournament=self.tournament,
            match_number=1,
            player1=self.player1,
            player2=self.player2,
            round=1
        )
        
        url = reverse('tournament-fixtures', kwargs={'tournament_id': self.tournament.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_fixture(self):
        """Test updating a fixture"""
        fixture = Fixture.objects.create(
            tournament=self.tournament,
            match_number=1,
            player1=self.player1,
            player2=self.player2,
            round=1
        )
        
        url = reverse('fixture-detail', kwargs={'pk': fixture.id})
        data = {
            'winner': self.player1.id,
            'score': '21-19, 21-15'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_fixture = Fixture.objects.get(id=fixture.id)
        self.assertEqual(updated_fixture.winner, self.player1)
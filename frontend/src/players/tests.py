from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Player
from datetime import datetime

class PlayerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.player_data = {
            'name': 'Test Player',
            'age': 25,
            'email': 'test@example.com',
            'phone': '1234567890',
            'category': 'MS'
        }
        self.player = Player.objects.create(**self.player_data)

    def test_create_player(self):
        """Test creating a new player"""
        url = reverse('player-list')
        data = {
            'name': 'New Player',
            'age': 26,
            'email': 'new@example.com',
            'phone': '0987654321',
            'category': 'MS'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Player.objects.count(), 2)

    def test_create_player_invalid_data(self):
        """Test creating a player with invalid data"""
        url = reverse('player-list')
        data = {
            'name': '',  # Invalid: empty name
            'age': 'invalid',  # Invalid: non-numeric age
            'email': 'invalid-email',  # Invalid: incorrect email format
            'phone': '123',  # Invalid: too short
            'category': 'INVALID'  # Invalid: incorrect category
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_player_list(self):
        """Test retrieving player list"""
        url = reverse('player-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_player_detail(self):
        """Test retrieving player detail"""
        url = reverse('player-detail', kwargs={'pk': self.player.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.player_data['name'])

    def test_update_player(self):
        """Test updating a player"""
        url = reverse('player-detail', kwargs={'pk': self.player.id})
        update_data = {
            'name': 'Updated Name',
            'ranking': 1000
        }
        response = self.client.patch(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.player.refresh_from_db()
        self.assertEqual(self.player.name, 'Updated Name')
        self.assertEqual(self.player.ranking, 1000)

    def test_delete_player(self):
        """Test deleting a player"""
        url = reverse('player-detail', kwargs={'pk': self.player.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Player.objects.count(), 0)

    def test_player_statistics(self):
        """Test player statistics calculation"""
        # Update player with some match statistics
        self.player.matches_played = 10
        self.player.matches_won = 8
        self.player.save()

        url = reverse('player-detail', kwargs={'pk': self.player.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['win_percentage'], 80.0)

    def test_unique_email_constraint(self):
        """Test that email addresses must be unique"""
        url = reverse('player-list')
        data = {
            'name': 'Another Player',
            'age': 27,
            'email': 'test@example.com',  # Same email as existing player
            'phone': '9876543210',
            'category': 'MS'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
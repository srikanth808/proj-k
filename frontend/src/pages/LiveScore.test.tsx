import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveScore from './LiveScore';
import api from '../services/api';

// Mock the api module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('LiveScore', () => {
  it('should render a list of live matches', async () => {
    // Given
    const matches = [
      { id: 1, fixture: { player1: { name: 'Player 1' }, player2: { name: 'Player 2' } }, score1: 10, score2: 5 },
      { id: 2, fixture: { player1: { name: 'Player 3' }, player2: { name: 'Player 4' } }, score1: 8, score2: 12 },
    ];
    // First call: matches list
    mockedApi.get.mockResolvedValueOnce({ data: matches } as any);

    // Games for match 1 and match 2 (when fetchGames is called after starting live)
    const gamesForMatch1 = [{ id: 1, game_number: 1, player1_score: 10, player2_score: 5, completed: true }];
    const gamesForMatch2 = [{ id: 2, game_number: 1, player1_score: 8, player2_score: 12, completed: true }];

    // When startLive triggers, LiveScore will call api.get for games; provide responses in order
    mockedApi.get.mockResolvedValueOnce({ data: gamesForMatch1 } as any).mockResolvedValueOnce({ data: gamesForMatch2 } as any);

    // When
    render(
      <MemoryRouter>
        <LiveScore />
      </MemoryRouter>
    );

    // Then: wait for matches to render
    expect(await screen.findByText('Player 1 vs Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3 vs Player 4')).toBeInTheDocument();

    // Start live for first match to fetch and display games
    const startButtons = await screen.findAllByText('Start Live');
    expect(startButtons.length).toBeGreaterThan(0);
    startButtons[0].click();

    // Now the games panel should show the score
    expect(await screen.findByText('10 - 5')).toBeInTheDocument();
    // (Optionally open second match and check its games if test desires)
  });
});

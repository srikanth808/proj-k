import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayersList from './PlayersList';
import api from '../services/api';


// Mock the api module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('PlayersList', () => {
  it('should render a list of players', async () => {
    // Given
    const players = [
      { id: 1, name: 'Player 1', age: 25, category: 'MS' },
      { id: 2, name: 'Player 2', age: 28, category: 'WS' },
    ];
    mockedApi.get.mockResolvedValue({
      data: players,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);

    // When
    render(
      <MemoryRouter>
        <PlayersList />
      </MemoryRouter>
    );

    // Then
    expect(await screen.findByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });
});

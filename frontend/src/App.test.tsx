import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import api from './services/api';

jest.mock('./services/api');
const mockedApi = api as jest.Mocked<typeof api>;
mockedApi.get = jest.fn().mockResolvedValue({ data: [] } as any);

test('renders welcome message', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/Badminton Tournament Manager/i);
  expect(linkElement).toBeInTheDocument();
});

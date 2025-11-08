import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Registration from './Registration';
import api from '../services/api';

// Mock the api module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;
import { BrowserRouter } from 'react-router-dom';

describe('Registration Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Registration />
      </BrowserRouter>
    );
  };

  test('renders registration form', () => {
    renderComponent();
    expect(screen.getByText(/Player Registration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderComponent();
  const submitButton = screen.getByRole('button', { name: /Register Player/i });
  fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    renderComponent();
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Age/i), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Select Tournament Category/i), {
      target: { value: 'MS' },
    });

    // Mock successful post response
    mockedApi.post.mockResolvedValueOnce({ data: { name: 'John Doe' } } as any);

    const submitButton = screen.getByRole('button', { name: /Register Player/i });
    fireEvent.click(submitButton);

    // Wait for success message
    expect(await screen.findByText(/registered successfully/i)).toBeInTheDocument();
  });
});
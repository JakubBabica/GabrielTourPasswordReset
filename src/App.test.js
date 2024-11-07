import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // Set up a mock URL with parameters for testing
  const mockUrl = '?id_Klient=12345&Email=test@example.com&Klic=mockedAuthKey';
  const mockLocation = new URL(`http://localhost/${mockUrl}`);
  global.window = Object.create(window);
  Object.defineProperty(window, 'location', {
    value: mockLocation,
  });
});

// Mock the fetch function for API calls
global.fetch = jest.fn();

describe('App Component', () => {
  it('renders the component and displays the initial text', () => {
    render(<App />);
    expect(screen.getByText('Resetovať Heslo')).toBeInTheDocument();
    expect(screen.getByText('Overujem overovací kľúč...')).toBeInTheDocument();
  });

  it('extracts URL parameters and calls verifyAuthKey', async () => {
    // Mock the response for the auth verification
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Authorizačný kľúč je platný.' }),
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.queryByText('Overujem overovací kľúč...')).not.toBeInTheDocument());
    expect(screen.getByText('Resetovať Heslo')).toBeInTheDocument();
  });

  it('displays an error if URL parameters are missing', () => {
    Object.defineProperty(window, 'location', { value: new URL('http://localhost/') });
    render(<App />);
    expect(screen.getByText('URL neobsahuje požadovaný input.')).toBeInTheDocument();
  });

  it('displays an error message if the auth key is invalid', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Authorizačný kľúč je neplatný.' }),
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Authorizačný kľúč je neplatný.')).toBeInTheDocument());
  });

  it('validates passwords before submitting', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Authorizačný kľúč je platný.' }),
    });

    await act(async () => {
      render(<App />);
    });

    // Wait for the auth key to be verified and input fields to appear
    await waitFor(() => screen.getByPlaceholderText('Vložte nové heslo'));

    fireEvent.change(screen.getByPlaceholderText('Vložte nové heslo'), { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText('Potvrďte nové heslo'), { target: { value: 'password2' } });
    fireEvent.click(screen.getByText('Zmeniť heslo'));

    expect(screen.getByText('Heslá sa nezhodujú.')).toBeInTheDocument();
  });

  it('calls the change-password API with valid data', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Authorizačný kľúč je platný.' }),
    });

    await act(async () => {
      render(<App />);
    });

    // Wait for the auth key to be verified and input fields to appear
    await waitFor(() => screen.getByPlaceholderText('Vložte nové heslo'));

    // Fill in the passwords and submit
    fireEvent.change(screen.getByPlaceholderText('Vložte nové heslo'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Potvrďte nové heslo'), { target: { value: 'password123' } });

    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Heslo bolo úspešne zmenené.' }),
    });

    fireEvent.click(screen.getByText('Zmeniť heslo'));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      'http://16.16.178.5/auth/change-password',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ));

    await waitFor(() => expect(screen.getByText('Heslo bolo úspešne zmenené.')).toBeInTheDocument());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

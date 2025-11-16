import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import App from './App';
import { createAppStore } from './store';
import { initialState } from './store/appSlice';

const renderWithProviders = (ui, { preloadedState } = {}) => {
  const store = createAppStore({
    app: { ...initialState, ...(preloadedState?.app || {}) },
  });

  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
};

// Mock Plotly components (they require browser APIs not available in Jest)
jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: ({ data, layout }) => (
    <div data-testid="plotly-chart" data-plotly-data={JSON.stringify(data)} data-plotly-layout={JSON.stringify(layout)}>
      Plotly Chart Mock
    </div>
  ),
}));

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock the config module
jest.mock('./config', () => ({
  __esModule: true,
  default: {
    API_BASE_URL: 'http://localhost:8000',
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    // Reset axios mock
    const axios = require('axios').default;
    axios.post.mockClear();
  });

  it('renders the main heading', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = jest.fn(() => Promise.reject(new Error('Test error')));
    
    await act(async () => {
      renderWithProviders(<App />);
    });

    await act(async () => {
      await waitFor(() => {
        expect(screen.queryByText(/Loading sample data/i)).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    const heading = screen.getByText(/TOON Token Savings Demo/i);
    expect(heading).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('displays loading message initially', async () => {
    // Mock fetch to never resolve (keeps loading state)
    global.fetch = jest.fn(() => new Promise(() => {}));
    
    await act(async () => {
      renderWithProviders(<App />);
    });

    // Check loading state immediately after render
    expect(screen.getByText(/Loading sample data/i)).toBeInTheDocument();
  });

  it('loads and displays sample data', async () => {
    // Mock successful fetch for sample data
    const sampleData = [{ id: 1, name: 'Test Employee', department: 'Engineering' }];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sampleData),
      })
    );

    // Mock successful API upload response
    const axios = require('axios').default;
    const mockUploadResponse = {
      data: {
        toon: 'test toon format',
        comparison: {
          json_tokens: 100,
          toon_tokens: 60,
          savings: 40,
        },
        original_json: JSON.stringify(sampleData, null, 2),
      },
    };
    axios.post.mockResolvedValueOnce(mockUploadResponse);

    // Render component and wait for all async operations
    await act(async () => {
      renderWithProviders(<App />);
    });

    // Wait for fetch to be called
    await act(async () => {
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/data/employee_records.json');
      }, { timeout: 3000 });
    });

    // Wait for axios.post to be called
    await act(async () => {
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    // Wait for all state updates to complete
    await act(async () => {
      await waitFor(() => {
        expect(screen.queryByText(/Loading sample data/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  it('toggles decoded JSON visibility via the button without re-decoding', async () => {
    const sampleData = [{ id: 1, name: 'Test Employee', department: 'Engineering' }];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sampleData),
      })
    );

    const axios = require('axios').default;
    const mockUploadResponse = {
      data: {
        toon: 'test toon format',
        comparison: {
          json_tokens: 100,
          toon_tokens: 60,
          savings: 40,
        },
        original_json: '', // Force decode API usage
      },
    };
    axios.post.mockResolvedValueOnce(mockUploadResponse); // Upload
    axios.post.mockResolvedValueOnce({ data: { data: sampleData } }); // Decode

    await act(async () => {
      renderWithProviders(<App />);
    });

    const decodeButton = await screen.findByRole('button', { name: /Decode to JSON/i });

    // Click decode button to show JSON
    await act(async () => {
      await userEvent.click(decodeButton);
    });

    expect(await screen.findByText(/Decoded JSON/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(2); // upload + single decode

    // Click hide button (separate button, should not re-trigger decode)
    const hideButton = await screen.findByRole('button', { name: /Hide JSON/i });
    await act(async () => {
      await userEvent.click(hideButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Decoded JSON/i)).not.toBeInTheDocument();
    });

    // No additional decode calls should have been made
    expect(axios.post).toHaveBeenCalledTimes(2);

    // Click decode button again to show JSON (should use cached, not re-decode)
    const decodeButtonAgain = await screen.findByRole('button', { name: /Decode to JSON/i });
    await act(async () => {
      await userEvent.click(decodeButtonAgain);
    });

    await waitFor(() => {
      expect(screen.getByText(/Decoded JSON/i)).toBeInTheDocument();
    });

    // Still only 2 decode calls (no new ones)
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});


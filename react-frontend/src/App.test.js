import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

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

  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText(/TOON Token Savings Demo/i);
    expect(heading).toBeInTheDocument();
  });

  it('displays loading message initially', () => {
    // Mock fetch to never resolve (keeps loading state)
    global.fetch = jest.fn(() => new Promise(() => {}));
    
    render(<App />);
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

    await act(async () => {
      render(<App />);
    });

    // Wait for sample data to load
    await act(async () => {
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    // Check that loading message is gone
    await waitFor(() => {
      expect(screen.queryByText(/Loading sample data/i)).not.toBeInTheDocument();
    });
  });
});


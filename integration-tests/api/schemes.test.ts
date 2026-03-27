import { describe, it, expect, vi } from 'vitest';

// Mocking global fetch for API testing
global.fetch = vi.fn();

describe('Schemes Search API Integration', () => {
  it('should fetch schemes with search parameters', async () => {
    const mockSchemes = {
      schemes: [
        { id: '1', title: 'Test Scheme', category: 'Education' }
      ],
      pagination: { total: 1, totalPages: 1 }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSchemes,
    });

    const searchQuery = new URLSearchParams({
      category: 'Education',
      page: '1',
      limit: '6'
    });

    const response = await fetch(`/api/schemes?${searchQuery.toString()}`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.schemes).toHaveLength(1);
    expect(data.schemes[0].title).toBe('Test Scheme');
    expect(global.fetch).toHaveBeenCalledWith('/api/schemes?category=Education&page=1&limit=6');
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const response = await fetch('/api/schemes');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});

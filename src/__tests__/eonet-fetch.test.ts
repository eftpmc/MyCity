/**
 * Tests for EONET API fetching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEvents } from '../services/eonet';
import { EventQuery } from '../types/events';

// Mock fetch
global.fetch = vi.fn();

describe('fetchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch events successfully', async () => {
    const mockResponse = {
      title: 'EONET Events',
      description: 'Natural events',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events',
      events: [
        {
          id: '1',
          title: 'Test Event',
          description: 'Test Description',
          link: 'https://example.com',
          closed: null,
          categories: [{ id: 'floods', title: 'Floods' }],
          sources: [{ id: 'src1', url: 'https://example.com' }],
          geometry: [
            {
              date: '2025-10-04T00:00:00Z',
              type: 'Point' as const,
              coordinates: [-122.4, 37.8],
            },
          ],
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
    };

    const events = await fetchEvents(query);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('1');
    expect(events[0].title).toBe('Test Event');
  });

  it('should handle pagination up to MAX_PAGES', async () => {
    const mockPage1 = {
      title: 'EONET Events',
      description: 'Natural events',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events',
      events: [
        {
          id: '1',
          title: 'Event 1',
          description: null,
          link: 'https://example.com',
          closed: null,
          categories: [{ id: 'floods', title: 'Floods' }],
          sources: [],
          geometry: [
            {
              date: '2025-10-04T00:00:00Z',
              type: 'Point' as const,
              coordinates: [0, 0],
            },
          ],
        },
      ],
      links: {
        next: 'https://eonet.gsfc.nasa.gov/api/v3/events?page=2',
      },
    };

    const mockPage2 = {
      ...mockPage1,
      events: [
        {
          ...mockPage1.events[0],
          id: '2',
          title: 'Event 2',
        },
      ],
      links: {
        next: 'https://eonet.gsfc.nasa.gov/api/v3/events?page=3',
      },
    };

    const mockPage3 = {
      ...mockPage1,
      events: [
        {
          ...mockPage1.events[0],
          id: '3',
          title: 'Event 3',
        },
      ],
      links: {},
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage2,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage3,
      });

    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
    };

    const events = await fetchEvents(query);

    expect(events).toHaveLength(3);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw error on failed request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
    };

    await expect(fetchEvents(query)).rejects.toThrow('EONET API error');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
    };

    await expect(fetchEvents(query)).rejects.toThrow('Failed to fetch EONET data');
  });
});

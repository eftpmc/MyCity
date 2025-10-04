/**
 * Tests for EONET URL building
 */

import { describe, it, expect } from 'vitest';
import { buildEonetUrl } from '../services/eonet';
import { EventQuery } from '../types/events';

describe('buildEonetUrl', () => {
  it('should build basic URL with start and end dates', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      status: 'all',
    };

    const url = buildEonetUrl(query);

    expect(url).toContain('start=2020-10-04');
    expect(url).toContain('end=2025-10-04');
    expect(url).toContain('status=all');
    expect(url).toContain('limit=100');
  });

  it('should include categories in URL', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      categories: ['floods', 'wildfires', 'volcanoes'],
    };

    const url = buildEonetUrl(query);

    expect(url).toContain('category=floods%2Cwildfires%2Cvolcanoes');
  });

  it('should include bbox when provided', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      bbox: [-180, -90, 180, 90],
    };

    const url = buildEonetUrl(query);

    expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
  });

  it('should handle custom limit', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      limit: 50,
    };

    const url = buildEonetUrl(query);

    expect(url).toContain('limit=50');
  });

  it('should build complete URL with all parameters', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      categories: ['floods', 'wildfires'],
      bbox: [-180, -90, 180, 90],
      limit: 75,
      status: 'open',
    };

    const url = buildEonetUrl(query);

    expect(url).toContain('start=2020-10-04');
    expect(url).toContain('end=2025-10-04');
    expect(url).toContain('category=floods%2Cwildfires');
    expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
    expect(url).toContain('limit=75');
    expect(url).toContain('status=open');
  });

  it('should not include category param when categories array is empty', () => {
    const query: EventQuery = {
      start: '2020-10-04',
      end: '2025-10-04',
      categories: [],
    };

    const url = buildEonetUrl(query);

    expect(url).not.toContain('category=');
  });
});

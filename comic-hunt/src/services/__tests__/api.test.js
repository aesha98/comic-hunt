import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { searchCharacters, getComicsByCharacter } from '../api';

vi.mock('axios');

describe('api service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('searchCharacters returns empty when no query', async () => {
    const data = await searchCharacters('');
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
  });

  it('searchCharacters returns mapped data', async () => {
    axios.get.mockResolvedValue({
      data: { results: [{ id: 1, name: 'A', image: 'x' }], total: 1, page: 1 },
    });
    const res = await searchCharacters('bat');
    expect(axios.get).toHaveBeenCalled();
    expect(res.results[0].id).toBe(1);
  });

  it('getComicsByCharacter returns mapped data', async () => {
    axios.get.mockResolvedValue({
      data: { results: [{ id: 2, name: 'Issue' }], total: 1, page: 1 },
    });
    const res = await getComicsByCharacter(1);
    expect(axios.get).toHaveBeenCalled();
    expect(res.results[0].id).toBe(2);
  });
});


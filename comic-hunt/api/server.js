import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.COMICVINE_API_KEY;
const BASE_URL = 'https://comicvine.gamespot.com/api';

if (!API_KEY) {
  console.warn('[comic-hunt] Missing COMICVINE_API_KEY environment variable.');
}

app.use(cors());

// Basic in-memory cache to soften rate limits (very small and short-lived)
const cache = new Map();
const CACHE_TTL_MS = 60_000; // 1 minute

function cacheKey(path, params) {
  return `${path}?${new URLSearchParams(params).toString()}`;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

async function comicVineFetch(path, params = {}) {
  if (!API_KEY) {
    throw new Error('Server missing COMICVINE_API_KEY');
  }
  const searchParams = new URLSearchParams({
    format: 'json',
    api_key: API_KEY,
    ...params,
  });

  const key = cacheKey(path, params);
  const cached = getCache(key);
  if (cached) return cached;

  const url = `${BASE_URL}${path}?${searchParams.toString()}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ComicVine error ${response.status}: ${text}`);
  }
  const json = await response.json();
  setCache(key, json);
  return json;
}

// GET /api/search?query=...
app.get('/api/search', async (req, res) => {
  try {
    const { query = '', page = '1', limit = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const data = await comicVineFetch('/search/', {
      query,
      resources: 'character',
      limit,
      offset,
      field_list: 'id,name,deck,image',
      sort: 'name:asc',
    });

    const results =
      data?.results?.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.deck || '',
        image: c.image?.thumb_url || '',
      })) ?? [];

    res.json({
      results,
      total: data?.number_of_total_results ?? 0,
      page: Number(page),
      pageSize: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// GET /api/characters/:id/comics?page=...
app.get('/api/characters/:id/comics', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const data = await comicVineFetch('/issues/', {
      filter: `character_appearances:${id}`,
      sort: 'cover_date:desc',
      limit,
      offset,
      field_list: 'id,name,issue_number,cover_date,image,volume',
    });

    const results =
      data?.results?.map((issue) => ({
        id: issue.id,
        title: issue.name || issue.volume?.name || 'Untitled',
        issueNumber: issue.issue_number,
        coverDate: issue.cover_date,
        image: issue.image?.thumb_url || '',
        volume: issue.volume?.name || '',
      })) ?? [];

    res.json({
      results,
      total: data?.number_of_total_results ?? 0,
      page: Number(page),
      pageSize: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Comics fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[comic-hunt] API proxy running on http://localhost:${PORT}`);
});



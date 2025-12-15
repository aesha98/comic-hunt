import axios from 'axios';

const API_BASE = '/api';
const PAGE_SIZE = 10;

export function getPageSize() {
  return PAGE_SIZE;
}

export async function searchCharacters(query, page = 1) {
  if (!query) {
    return { results: [], total: 0, page, pageSize: PAGE_SIZE };
  }

  const { data } = await axios.get(`${API_BASE}/search`, {
    params: { query, page, limit: PAGE_SIZE },
  });
  return data;
}

export async function getComicsByCharacter(id, page = 1) {
  if (!id) {
    return { results: [], total: 0, page, pageSize: PAGE_SIZE };
  }

  const { data } = await axios.get(`${API_BASE}/characters/${id}/comics`, {
    params: { page, limit: PAGE_SIZE },
  });
  return data;
}


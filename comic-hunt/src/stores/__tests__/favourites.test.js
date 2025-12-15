import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFavouriteStore } from '../favourites';
import { useUserStore } from '../user';

const createMockStorage = () => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
};

describe('favourites store', () => {
  beforeEach(() => {
    global.localStorage = createMockStorage();
    setActivePinia(createPinia());
    const user = useUserStore();
    user.user = { id: 'demo', name: 'Demo' };
  });

  it('adds and removes favourites and persists per user', () => {
    const store = useFavouriteStore();
    store.add({ id: 1, title: 'Issue #1' });
    expect(store.items).toHaveLength(1);
    expect(store.isFav(1)).toBe(true);

    store.remove(1);
    expect(store.items).toHaveLength(0);
    expect(store.isFav(1)).toBe(false);
  });

  it('loads favourites for a user from storage', () => {
    const store = useFavouriteStore();
    store.add({ id: 2, title: 'Issue #2' });

    const { items } = store;
    store.items = [];

    store.loadForUser('demo');
    expect(store.items).toEqual(items);
  });
});


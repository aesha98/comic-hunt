import { defineStore } from 'pinia';

// export const useUserStoretwo = defineStore('user', {
//   state: () => ({

//   }),
  
// })

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  getters: {
    isAuthed: (s) => !!s.user,
    name: (s) => s.user?.name ?? '',
  },
  actions: {
    load() {
      const raw = localStorage.getItem('auth:user');
      this.user = raw ? JSON.parse(raw) : null;
    },
    login({ username, password }) {
      // ✅ dummy validation
      if (username === 'demo' && password === '12345') {
        this.user = { id: 'demo', name: 'Demo User' };
        localStorage.setItem('auth:user', JSON.stringify(this.user));
      } else {
        throw new Error('Invalid credentials'); // fail login
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('auth:user');
    },
  },
});

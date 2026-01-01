7-Day Development Checklist (Updated)
Day 1: Backend API
[ ] Create Express server (api/server.js)
[ ] Set up Marvel API client with authentication
[ ] Implement /api/search endpoint (character search)
[ ] Implement /api/characters/:id/comics endpoint
[ ] Test endpoints with curl/Postman
[ ] Configure Vite proxy for /api routes
[ ] Add error handling
Day 2: State Management & Services
[ ] Create User store (src/stores/user.js)
[ ] Implement login(), logout(), load()
[ ] Add localStorage persistence
[ ] Test login flow
[ ] Create Favourites store (src/stores/favourites.js)
[ ] Implement add(), remove(), isFav()
[ ] Add per-user localStorage
[ ] Test favorites persistence
[ ] Create API service (src/services/api.js)
[ ] Implement searchCharacters()
[ ] Implement getComicsByCharacter()
[ ] Test API calls from frontend
Day 3: Core UI Components
[ ] Build Searchbar.vue component
[ ] Input field + submit button
[ ] Emit search event
[ ] Build Pagination.vue component
[ ] Prev/Next buttons
[ ] Emit change event
[ ] Build AppHeader.vue component
[ ] Logo/branding
[ ] Integrate Searchbar
[ ] User info display
[ ] Build ComicItem.vue component
[ ] Display comic image, title, description
[ ] Favorite button (heart icon)
[ ] Toggle favorite on click
Day 4: Pages & Routing
[ ] Create Login.vue page
[ ] Login form (username/password)
[ ] Connect to User store
[ ] Error handling
[ ] Create HomePage.vue page
[ ] Integrate Searchbar
[ ] Display search results
[ ] Show comics list
[ ] Integrate Pagination
[ ] Loading states
[ ] Create DisplayResult.vue component
[ ] Map comics to ComicItem components
[ ] Set up Vue Router (src/router/router.js)
[ ] Define routes (/, /login, etc.)
[ ] Add route guards (protect pages if needed)
Day 5: Features & Polish
[ ] Build WishListPanel.vue component
[ ] Display user's favorites
[ ] Remove from favorites
[ ] Add loading spinners
[ ] Add empty states (no results, no favorites)
[ ] Add error messages/toasts
[ ] Responsive design (mobile-friendly)
[ ] Test full user flow:
[ ] Login → Search → View comics → Favorite → View wishlist
Day 6: Testing & Bug Fixes
[ ] Write unit tests for stores
[ ] Test edge cases (empty search, API errors)
[ ] Fix bugs found during testing
[ ] Add README with setup instructions
[ ] Environment variables for API keys
Day 7: Deployment
[ ] Deploy backend (Heroku/Railway/Vercel)
[ ] Deploy frontend (Vercel/Netlify)
[ ] Final testing on deployed version
[ ] Push code to GitHu

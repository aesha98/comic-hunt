import { createWebHistory, createRouter} from "vue-router";
import { useUserStore } from "../stores/user";
import Login from "../components/Login/Login.vue";
import HomePage from "../components/HomePage.vue";

const routes = [
	{ path: '/', redirect: '/login' },                        
	{ path: '/login', name: 'login', component: Login },
	{ path: '/home',  name: 'home',  component: HomePage, meta: { requiresAuth: true } },
  { path: '/character/:id', name: 'character', component: HomePage, meta: { requiresAuth: true }, props: true },
  ];

const router = createRouter({
	history:createWebHistory(),
	routes,
})

router.beforeEach((to, from) => {
	const user = useUserStore();
	if (user.user === null) user.load();
  
	if (to.meta.requiresAuth && !user.isAuthed) {
	  if (to.name !== 'login') {
		return { name: 'login', query: { redirect: to.fullPath } };
	  }
	  return; // already on login
	}
  
	if (to.name === 'login' && user.isAuthed) {
	  if (from.name !== 'home') return { name: 'home' };
	}
  });
  
export default router;
import { defineStore } from "pinia";
import { useUserStore } from "./user";

const KEY = (id) => `favourites:${id}`;

export const useFavouriteStore = defineStore('favourites', {
	state: () => ({
		items: [],
		loadedFor: null,
	}),
	getters: {
		isFav: (state) => (id) => state.items.some((c) => c.id === id),
	},
	actions: {
		loadForUser(uid) {
			if (!uid) return;
			if (this.loadedFor === uid) return;
			const raw = localStorage.getItem(KEY(uid));
			this.items = raw ? JSON.parse(raw) : [];
			this.loadedFor = uid;
		},
		save(uid) {
			if (!uid) return;
			localStorage.setItem(KEY(uid), JSON.stringify(this.items));
		},
		add(comic) {
			const user = useUserStore();
			this.loadForUser(user.user?.id);
			if (!comic || this.isFav(comic.id)) return;
			this.items.push(comic);
			this.save(user.user?.id);
		},
		remove(id) {
			const user = useUserStore();
			this.loadForUser(user.user?.id);
			this.items = this.items.filter((c) => c.id !== id);
			this.save(user.user?.id);
		},
		clear() {
			const user = useUserStore();
			this.items = [];
			this.save(user.user?.id);
		},
	}
});
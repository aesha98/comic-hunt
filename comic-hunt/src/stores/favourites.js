import { defineStore } from "pinia";
import { useUserStore } from "./user";

//key builder 
const KEY = (id) => 'favourites:$id'

//create a store
export const useFavouriteStore = defineStore('favourites', {
		state: () => ({items : [],loadedFor : null}),
		actions: {
			loadForUser(uid) {this.items = JSON.parse(localStorage.getItem(KEY(id)) || '[]')}
		},
		save(uid){

		},
		add(comic){

		},
		remove(id){

		},clear(){}
	}
)
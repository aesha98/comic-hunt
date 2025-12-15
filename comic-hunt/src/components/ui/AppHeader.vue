<script setup>
import Searchbar from './Searchbar.vue'
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { defineEmits } from 'vue';

const user = useUserStore();
const router = useRouter();
const emit = defineEmits(['search']);

function onSearch(term) {
  emit('search', term);
}

async function logout(){
	user.logout();
	await router.replace({name: 'login'})
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b">
    <!-- top bar -->
    <div class="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between gap-4">
      <!-- Brand + (desktop) search inline -->
      <div class="flex items-center gap-4 min-w-0">
        <router-link
          to="/home"
          class="shrink-0 text-lg font-bold text-indigo-600 hover:text-indigo-700"
          aria-label="Go to Home"
        >
          Comic Hunt
        </router-link>

        <!-- desktop / tablet search -->
        <div class="flex flex-1 items-center gap-2">
          <Searchbar class="flex-1" @search="onSearch"/>
        </div>
      </div>

      <!-- Right side: username + logout -->
	   <template v-if="user.isAuthed">
      <div class="flex items-center gap-3">
        <span
          class="max-w-[12rem] truncate px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
          title="username"
        >
          {{ user.name }}
        </span>
        <button
          class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 active:scale-[.98] transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="button"
		  @click="logout"
        >
          Logout
        </button>
      </div>
	  </template>
    </div>

    <!-- mobile search (stacks below bar) -->
    <div class="sm:hidden max-w-7xl mx-auto px-4 pb-3">
      <Searchbar @search="onSearch" />
    </div>
  </header>
</template>
<style scoped>
/* no custom CSS needed — Tailwind handles it */
</style>


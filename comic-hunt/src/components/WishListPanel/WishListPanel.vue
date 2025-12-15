<script setup>
import { computed, onMounted } from 'vue';
import { useFavouriteStore } from '../../stores/favourites';
import { useUserStore } from '../../stores/user';

const favourites = useFavouriteStore();
const user = useUserStore();

onMounted(() => {
  favourites.loadForUser(user.user?.id);
});

const items = computed(() => favourites.items);

function remove(id) {
  favourites.remove(id);
}

function clear() {
  favourites.clear();
}
</script>

<template>
  <div class="space-y-3">
    <header class="flex items-center justify-between">
      <h2 class="font-semibold">Favorites</h2>
      <button
        class="text-sm text-red-600 hover:underline disabled:text-gray-400"
        :disabled="items.length === 0"
        type="button"
        @click="clear"
      >
        Clear
      </button>
    </header>
    <p v-if="items.length === 0" class="text-sm text-gray-500">
      No favorites yet. Add comics to build your wishlist.
    </p>
    <ul class="space-y-2">
      <li
        v-for="comic in items"
        :key="comic.id"
        class="flex items-center gap-3 border rounded-lg p-2 bg-white"
      >
        <img
          v-if="comic.image"
          :src="comic.image"
          alt=""
          class="w-12 h-16 rounded object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="font-medium truncate">{{ comic.title }}</p>
          <p class="text-xs text-gray-600 truncate">#{{ comic.issueNumber }} {{ comic.volume }}</p>
        </div>
        <button
          class="text-sm text-red-600 hover:underline"
          type="button"
          @click="remove(comic.id)"
        >
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
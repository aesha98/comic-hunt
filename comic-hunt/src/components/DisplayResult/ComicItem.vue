<script setup>
import { computed } from 'vue';
import { useFavouriteStore } from '../../stores/favourites';

const props = defineProps({
  comic: {
    type: Object,
    required: true,
  },
});

const favourites = useFavouriteStore();

const isFav = computed(() => favourites.isFav(props.comic.id));

function toggleFavourite() {
  if (isFav.value) {
    favourites.remove(props.comic.id);
  } else {
    favourites.add(props.comic);
  }
}
</script>

<template>
  <article class="border rounded-lg p-3 bg-white flex gap-3">
    <img
      v-if="comic.image"
      :src="comic.image"
      alt=""
      class="w-20 h-28 rounded object-cover"
    />
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-sm text-gray-500">{{ comic.coverDate || 'No date' }}</p>
      <h3 class="font-semibold leading-tight line-clamp-2">
        {{ comic.title }} <span v-if="comic.issueNumber">#{{ comic.issueNumber }}</span>
      </h3>
      <p class="text-sm text-gray-600 truncate">{{ comic.volume }}</p>
      <button
        class="mt-2 inline-flex items-center px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 active:scale-[.98] transition"
        type="button"
        @click="toggleFavourite"
      >
        {{ isFav ? 'Remove from Favorites' : 'Add to Favorites' }}
      </button>
    </div>
  </article>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';

const emit = defineEmits(['search']);
const term = ref('');
let debounceId = null;

function triggerSearch(immediate = false) {
  if (debounceId) clearTimeout(debounceId);
  const run = () => emit('search', term.value.trim());
  if (immediate) {
    run();
  } else {
    debounceId = setTimeout(run, 350);
  }
}

function onSubmit() {
  triggerSearch(true);
}

watch(term, () => triggerSearch(false));

onBeforeUnmount(() => {
  if (debounceId) clearTimeout(debounceId);
});
</script>

<template>
  <form class="w-full flex gap-2" @submit.prevent="onSubmit">
    <input
      v-model="term"
      type="text"
      placeholder="Search character..."
      class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <button
      type="submit"
      class="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[.98] transition"
    >
      Search
    </button>
  </form>
</template>
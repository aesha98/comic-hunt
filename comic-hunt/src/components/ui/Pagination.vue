<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['change']);

const canPrev = computed(() => props.page > 1);
const canNext = computed(() => props.page < props.totalPages);

function prev() {
  if (canPrev.value) emit('change', props.page - 1);
}

function next() {
  if (canNext.value) emit('change', props.page + 1);
}
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <button
      class="px-2 py-1 text-sm border rounded disabled:opacity-50"
      :disabled="!canPrev"
      @click="prev"
      type="button"
    >
      Prev
    </button>
    <span class="text-sm text-gray-600">
      {{ page }} / {{ totalPages }}
    </span>
    <button
      class="px-2 py-1 text-sm border rounded disabled:opacity-50"
      :disabled="!canNext"
      @click="next"
      type="button"
    >
      Next
    </button>
  </div>
</template>
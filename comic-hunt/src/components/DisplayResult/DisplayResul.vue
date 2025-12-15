<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ComicItem from './ComicItem.vue';
import Pagination from '../ui/Pagination.vue';
import { searchCharacters, getComicsByCharacter, getPageSize } from '../../services/api';

const props = defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
});

const route = useRoute();
const router = useRouter();

const characters = ref([]);
const charactersTotal = ref(0);
const charactersPage = ref(1);
const loadingSearch = ref(false);
const searchError = ref('');

const selectedCharacter = ref(null);
const comics = ref([]);
const comicsTotal = ref(0);
const comicsPage = ref(1);
const loadingComics = ref(false);
const comicsError = ref('');

const pageSize = getPageSize();

const characterPages = computed(() =>
  Math.max(1, Math.ceil(charactersTotal.value / pageSize))
);
const comicPages = computed(() =>
  Math.max(1, Math.ceil(comicsTotal.value / pageSize))
);

async function runSearch(term, page = 1) {
  if (!term) {
    characters.value = [];
    charactersTotal.value = 0;
    charactersPage.value = 1;
    selectedCharacter.value = null;
    comics.value = [];
    comicsTotal.value = 0;
    comicsPage.value = 1;
    return;
  }
  loadingSearch.value = true;
  searchError.value = '';
  try {
    const data = await searchCharacters(term, page);
    characters.value = data.results;
    charactersTotal.value = data.total;
    charactersPage.value = data.page;
    // auto-select first character and load comics
    if (characters.value.length > 0) {
      selectedCharacter.value = characters.value[0];
      comicsPage.value = 1;
      await loadComics(1);
      router.replace({ name: 'character', params: { id: selectedCharacter.value.id } });
    } else {
      selectedCharacter.value = null;
      comics.value = [];
      comicsTotal.value = 0;
      comicsPage.value = 1;
    }
  } catch (e) {
    searchError.value = e.message || 'Search failed';
  } finally {
    loadingSearch.value = false;
  }
}

async function loadComics(page = 1) {
  if (!selectedCharacter.value) return;
  loadingComics.value = true;
  comicsError.value = '';
  try {
    const data = await getComicsByCharacter(selectedCharacter.value.id, page);
    comics.value = data.results;
    comicsTotal.value = data.total;
    comicsPage.value = data.page;
  } catch (e) {
    comicsError.value = e.message || 'Failed to load comics';
  } finally {
    loadingComics.value = false;
  }
}

function selectCharacter(character) {
  selectedCharacter.value = character;
  comicsPage.value = 1;
  loadComics(1);
  router.replace({ name: 'character', params: { id: character.id } });
}

function onComicsPageChange(page) {
  comicsPage.value = page;
  loadComics(page);
}

function onCharactersPageChange(page) {
  charactersPage.value = page;
  runSearch(props.searchTerm, page);
}

watch(
  () => props.searchTerm,
  (term) => {
    runSearch(term || '');
  }
);

onMounted(() => {
  const initialId = route.params.id;
  if (initialId) {
    selectedCharacter.value = {
      id: initialId,
      name: 'Selected Character',
      description: '',
      image: '',
    };
    loadComics();
  }
});
</script>

<template>
  <div class="space-y-6">
    <section class="bg-gray-50 border rounded-xl p-4">
      <header class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold">Characters</h2>
          <span v-if="loadingSearch" class="text-sm text-gray-500">Loading...</span>
        </div>
        <Pagination
          v-if="charactersTotal > pageSize"
          :page="charactersPage"
          :total-pages="characterPages"
          @change="onCharactersPageChange"
        />
      </header>

      <p v-if="searchError" class="text-sm text-red-600">{{ searchError }}</p>
      <p v-else-if="!props.searchTerm && !loadingSearch" class="text-sm text-gray-500">
        Start typing to search for characters.
      </p>
      <p v-else-if="!loadingSearch && characters.length === 0" class="text-sm text-gray-500">
        No characters found.
      </p>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="character in characters"
          :key="character.id"
          class="flex gap-3 p-3 bg-white border rounded-lg hover:border-indigo-400 cursor-pointer transition"
          @click="selectCharacter(character)"
        >
          <img
            v-if="character.image"
            :src="character.image"
            alt=""
            class="w-16 h-16 rounded object-cover"
          />
          <div class="min-w-0">
            <p class="font-semibold truncate">{{ character.name }}</p>
            <p class="text-sm text-gray-600 line-clamp-2">{{ character.description || 'No summary available.' }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-gray-50 border rounded-xl p-4">
      <header class="flex items-center justify-between gap-2 mb-3">
        <div>
          <h2 class="text-lg font-semibold">
            Comics
            <span v-if="selectedCharacter" class="text-sm text-gray-500">
              for {{ selectedCharacter.name }}
            </span>
          </h2>
          <p v-if="loadingComics" class="text-sm text-gray-500">Loading comics...</p>
        </div>
        <Pagination
          v-if="comicsTotal > pageSize"
          :page="comicsPage"
          :total-pages="comicPages"
          @change="onComicsPageChange"
        />
      </header>

      <p v-if="comicsError" class="text-sm text-red-600">{{ comicsError }}</p>
      <p v-else-if="!selectedCharacter" class="text-sm text-gray-500">
        Select a character to see their comics.
      </p>
      <p v-else-if="!loadingComics && comics.length === 0" class="text-sm text-gray-500">
        No comics found for this character.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ComicItem
          v-for="comic in comics"
          :key="comic.id"
          :comic="comic"
        />
      </div>
    </section>
  </div>
</template>
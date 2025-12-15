<script setup>
import { ref } from 'vue'
import DisplayResul from './DisplayResult/DisplayResul.vue';
import WishListPanel from './WishListPanel/WishListPanel.vue';
import AppHeader from './ui/AppHeader.vue';

const searchTerm = ref('');

function handleSearch(term) {
  searchTerm.value = term ?? '';
}
</script>

<template>
  <!-- Header Bar -->
  <AppHeader @search="handleSearch" />
   
  <!-- Page container -->
  <main class="max-w-7xl mx-auto px-4 py-4">
    <!-- responsive layout -->
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- LEFT: wishlist -->
      <aside
        class="w-full lg:w-[280px] shrink-0 self-start lg:sticky lg:top-14
               lg:h-[calc(100vh-3.5rem)] overflow-auto
               bg-white border rounded-xl p-3"
        aria-label="Wishlist">
        <WishListPanel />
      </aside>
    
      <!-- RIGHT: results -->
      <section class="flex-1 min-w-0 bg-white border rounded-xl p-3">
        <DisplayResul :search-term="searchTerm" />
      </section>
    </div>
  </main>
</template>

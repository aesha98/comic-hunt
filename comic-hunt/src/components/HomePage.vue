<script setup>
import { ref } from 'vue'
import DisplayResul from './DisplayResult/DisplayResul.vue';
import WishListPanel from './WishListPanel/WishListPanel.vue';
import AppHeader from './ui/AppHeader.vue';

defineProps({
  msg: String,
})

const count = ref(0)

function increment(){
  count.value++;
}
</script>

<template>
  <!-- Header Bar -->
    <AppHeader/>
   
 <!-- Page container -->
 <main class="max-w-7xl mx-auto px-4 py-4">
    <!-- 2-column layout: fixed left, fluid right -->
    <div class="flex gap-4">
      <!-- LEFT: wishlist (fixed width, sticky below the header) -->
      <aside
        class="w-[280px] shrink-0 self-start sticky top-14
               h-[calc(100vh-3.5rem)] overflow-auto
               bg-white border rounded-xl p-3"
        aria-label="Wishlist"
      >
        <WishListPanel />
      </aside>

      <!-- RIGHT: results (fills remaining space) -->
      <section class="flex-1 min-w-0 bg-white border rounded-xl p-3">
        <DisplayResul />
      </section>
    </div>
  </main>


</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const route = useRoute();
const user = useUserStore();

const username = ref('');
const password = ref('');
const error = ref('');

function submit() {
  try {
    user.login({ username: username.value, password: password.value });
    router.push(String(route.query.redirect || '/home'));
  } catch (e) {
    error.value = e.message || 'Login failed';
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center p-6">
    <form class="w-full max-w-sm border rounded-xl p-6 space-y-4" @submit.prevent="submit">
      <h1 class="text-xl font-semibold">Login</h1>
      <input v-model="username" placeholder="Username" class="w-full border rounded px-3 py-2" />
      <input v-model="password" type="password" placeholder="Password" class="w-full border rounded px-3 py-2" />
      <button class="w-full py-2 rounded bg-indigo-600 text-white">Login</button>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p class="text-sm text-gray-500">Use <b>demo / 12345</b> to login</p>
    </form>
  </div>
</template>

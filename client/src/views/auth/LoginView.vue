<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../store/user';

const store = useUserStore();
const router = useRouter();
const route = useRoute();

const email = ref('alina@schoolify.ru');
const password = ref('password123');
const error = ref(null);
const loading = ref(false);

async function submit() {
  error.value = null;
  loading.value = true;
  try {
    await store.login(email.value, password.value);
    router.push(route.query.redirect || { name: 'home' });
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <div class="brand">
      <h1>Schoolify</h1>
      <p class="muted">Волонтёрство стало проще!</p>
    </div>

    <div class="card">
      <h2 style="text-align: center; margin-bottom: 16px">Вход</h2>
      <form @submit.prevent="submit">
        <label class="field">Email<input v-model="email" type="email" class="input" autocomplete="username" /></label>
        <label class="field">Пароль<input v-model="password" type="password" class="input" autocomplete="current-password" /></label>
        <p v-if="error" class="error" style="margin-bottom: 10px">{{ error }}</p>
        <button class="btn btn-block" :disabled="loading">{{ loading ? '…' : 'Войти' }}</button>
      </form>
      <p style="text-align: center; margin-top: 14px">
        <router-link :to="{ name: 'register' }" class="green">Нет аккаунта? Зарегистрироваться</router-link>
      </p>
    </div>

    <p class="muted" style="text-align: center; margin-top: 16px; font-size: 13px">
      Демо: alina@schoolify.ru · organizer@schoolify.ru · admin@schoolify.ru<br />
      Пароль у всех: <code>password123</code>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../store/user';

const store = useUserStore();
const router = useRouter();
const route = useRoute();

const email = ref('student@schoolify.ru');
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
  <div class="auth">
    <h1>Вход</h1>
    <form @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" autocomplete="username" />
      </label>
      <label>
        Пароль
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn" :disabled="loading">{{ loading ? '…' : 'Войти' }}</button>
    </form>
    <p class="muted hint">
      Тестовые аккаунты: admin@ / organizer@ / student@schoolify.ru<br />
      Пароль у всех: <code>password123</code>
    </p>
  </div>
</template>

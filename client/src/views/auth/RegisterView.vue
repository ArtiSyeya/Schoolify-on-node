<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';

const store = useUserStore();
const router = useRouter();

const form = ref({ fullName: '', email: '', phone: '', password: '' });
const error = ref(null);
const loading = ref(false);

async function submit() {
  error.value = null;
  loading.value = true;
  try {
    await store.register(form.value);
    router.push({ name: 'home' });
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Ошибка регистрации';
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

    <div class="steps">
      <span class="step active">1</span>
      <i />
      <span class="step">2</span>
      <i />
      <span class="step">3</span>
    </div>

    <div class="card">
      <h2 style="text-align: center">Создать аккаунт</h2>
      <p class="muted" style="text-align: center; margin-bottom: 16px">Введи свои данные, чтобы стать волонтёром</p>

      <form @submit.prevent="submit">
        <label class="field">Полное имя<input v-model="form.fullName" class="input" required /></label>
        <label class="field">Email<input v-model="form.email" type="email" class="input" required /></label>
        <label class="field">Номер телефона<input v-model="form.phone" class="input" placeholder="+7 …" /></label>
        <label class="field">Пароль<input v-model="form.password" type="password" class="input" required /></label>
        <p v-if="error" class="error" style="margin-bottom: 10px">{{ error }}</p>
        <button class="btn btn-block" :disabled="loading">{{ loading ? '…' : 'Продолжить' }}</button>
      </form>

      <p style="text-align: center; margin-top: 14px">
        <router-link :to="{ name: 'login' }" class="green">Уже есть аккаунт? Войти</router-link>
      </p>
    </div>

    <p class="muted" style="text-align: center; margin-top: 16px; font-size: 12px">
      Продолжая, вы соглашаетесь с условиями пользования
    </p>
  </div>
</template>

<style scoped>
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}
.steps i {
  width: 40px;
  height: 2px;
  background: var(--border);
}
.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  color: var(--muted);
  font-weight: 600;
}
.step.active {
  background: var(--primary);
  color: #fff;
}
</style>

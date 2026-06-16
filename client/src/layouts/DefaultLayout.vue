<script setup>
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();

function logout() {
  store.logout();
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="app">
    <header class="navbar">
      <router-link to="/" class="brand">Schoolify</router-link>
      <nav class="nav">
        <router-link to="/events">Мероприятия</router-link>
        <router-link
          v-if="store.role === 'ORGANIZER' || store.role === 'ADMIN'"
          to="/organizer/events"
        >Мои мероприятия</router-link>
        <router-link v-if="store.role === 'ADMIN'" to="/admin/users">Админка</router-link>
        <router-link v-if="store.isAuth" to="/profile">Кабинет</router-link>
        <router-link v-if="!store.isAuth" to="/login">Вход</router-link>
        <a v-else href="#" @click.prevent="logout">Выход ({{ store.user.fullName }})</a>
      </nav>
    </header>

    <main class="container">
      <router-view />
    </main>

    <footer class="footer">Школа актива · технический прототип</footer>
  </div>
</template>

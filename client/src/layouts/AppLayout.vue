<script setup>
// Раскладка приложения: контент + нижняя навигация.
</script>

<template>
  <div class="app">
    <main class="app-main">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <router-link to="/" exact-active-class="router-link-active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
        </svg>
        Главная
      </router-link>
      <router-link to="/events">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
        События
      </router-link>
      <router-link to="/profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
        Профиль
      </router-link>
      <router-link to="/rating">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3" />
        </svg>
        Рейтинг
      </router-link>
    </nav>
  </div>
</template>

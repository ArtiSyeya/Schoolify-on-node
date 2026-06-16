<script setup>
import { ref, onMounted } from 'vue';
import { eventsService } from '../../services/events.service';

const events = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    events.value = await eventsService.list();
  } catch {
    error.value = 'Не удалось загрузить мероприятия';
  } finally {
    loading.value = false;
  }
});

const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <h1>Мероприятия</h1>

  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="!events.length">Пока нет опубликованных мероприятий.</p>

  <div v-else class="grid">
    <router-link
      v-for="e in events"
      :key="e.id"
      :to="`/events/${e.id}`"
      class="card"
    >
      <h3>{{ e.title }}</h3>
      <p class="muted">{{ e.location }}</p>
      <p>{{ fmtDate(e.startsAt) }}</p>
      <span class="badge">Свободно: {{ e.freeSeats ?? '∞' }}</span>
    </router-link>
  </div>
</template>

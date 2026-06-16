<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { eventsService } from '../../services/events.service';

const route = useRoute();
const event = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    event.value = await eventsService.getById(route.params.id);
  } catch {
    error.value = 'Мероприятие не найдено';
  } finally {
    loading.value = false;
  }
});

const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
</script>

<template>
  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>

  <article v-else>
    <router-link to="/events" class="back">← К списку</router-link>
    <h1>{{ event.title }}</h1>
    <p class="muted">{{ event.location }} · {{ fmtDate(event.startsAt) }}</p>
    <p>{{ event.description }}</p>
    <p>Организатор: {{ event.organizer?.fullName }}</p>
    <p>
      Свободно мест: <strong>{{ event.freeSeats ?? '∞' }}</strong>
      из {{ event.capacity || '∞' }}
    </p>
    <button class="btn" disabled title="Будет реализовано в feature/registrations">
      Зарегистрироваться
    </button>
  </article>
</template>

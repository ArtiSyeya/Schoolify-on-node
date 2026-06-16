<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { eventsService } from '../../services/events.service';

const route = useRoute();
const id = Number(route.params.id);

const participants = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    participants.value = await eventsService.participants(id);
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Не удалось загрузить участников';
  } finally {
    loading.value = false;
  }
});

async function exportCsv() {
  const res = await eventsService.exportParticipants(id);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `participants-${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <router-link :to="{ name: 'organizer-events' }" class="back">← К моим мероприятиям</router-link>

  <div class="page-head">
    <h1>Участники</h1>
    <button v-if="participants.length" class="btn btn-secondary" @click="exportCsv">Экспорт в CSV</button>
  </div>

  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="!participants.length" class="muted">Пока никто не записался.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Имя</th>
        <th>Email</th>
        <th>Записан</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p, i) in participants" :key="p.registrationId">
        <td>{{ i + 1 }}</td>
        <td>{{ p.user.fullName }}</td>
        <td>{{ p.user.email }}</td>
        <td>{{ fmtDate(p.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { eventsService } from '../../services/events.service';

const route = useRoute();
const id = Number(route.params.id);

const participants = ref([]);
const loading = ref(true);
const error = ref(null);
const busy = ref(null); // registrationId, для которого идёт запрос

async function load() {
  loading.value = true;
  error.value = null;
  try {
    participants.value = await eventsService.participants(id);
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Не удалось загрузить участников';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// подтвердить/снять посещение — очки волонтёру начисляются автоматически
async function toggleAttendance(p) {
  busy.value = p.registrationId;
  try {
    const res = await eventsService.setAttendance(id, p.registrationId, !p.attended);
    p.attended = res.attended;
  } catch (e) {
    alert(e.response?.data?.error?.message || 'Ошибка');
  } finally {
    busy.value = null;
  }
}

async function exportCsv() {
  const res = await eventsService.exportParticipants(id);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `participants-${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <router-link :to="{ name: 'organizer-events' }" class="back">‹ К моим мероприятиям</router-link>

  <div class="page-head">
    <h1>Участники</h1>
    <button v-if="participants.length" class="btn btn-secondary" @click="exportCsv">Экспорт в CSV</button>
  </div>

  <p class="muted" style="margin-bottom: 12px">
    Подтвердите посещение — волонтёру начислятся очки за событие.
  </p>

  <p v-if="loading" class="muted">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="!participants.length" class="muted">Пока никто не записался.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Имя</th>
        <th>Email</th>
        <th>Посещение</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p, i) in participants" :key="p.registrationId">
        <td>{{ i + 1 }}</td>
        <td>{{ p.user.fullName }}</td>
        <td>{{ p.user.email }}</td>
        <td>
          <span class="badge" :class="{ attended: p.attended }">
            {{ p.attended ? '✓ Подтверждено' : 'Ожидает' }}
          </span>
        </td>
        <td>
          <button
            class="btn btn-secondary"
            :disabled="busy === p.registrationId"
            @click="toggleAttendance(p)"
          >
            {{ p.attended ? 'Снять' : 'Подтвердить' }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../store/user';
import { registrationsService } from '../../services/registrations.service';

const store = useUserStore();
const isStudent = store.role === 'STUDENT';

const registrations = ref([]);
const loading = ref(true);

async function load() {
  if (!isStudent) {
    loading.value = false;
    return;
  }
  try {
    registrations.value = await registrationsService.my();
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function cancel(id) {
  await registrationsService.cancel(id);
  registrations.value = registrations.value.filter((r) => r.id !== id);
}

const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <h1>Личный кабинет</h1>
  <p><strong>{{ store.user?.fullName }}</strong> · {{ store.user?.email }}</p>
  <p>Роль: <span class="badge">{{ store.role }}</span></p>

  <template v-if="isStudent">
    <h2>Мои регистрации</h2>
    <p v-if="loading">Загрузка…</p>
    <p v-else-if="!registrations.length" class="muted">Вы пока никуда не записаны.</p>
    <ul v-else class="list">
      <li v-for="r in registrations" :key="r.id" class="list-item">
        <div>
          <router-link :to="`/events/${r.event.id}`">{{ r.event.title }}</router-link>
          <p class="muted">{{ r.event.location }} · {{ fmtDate(r.event.startsAt) }}</p>
        </div>
        <button class="btn btn-secondary" @click="cancel(r.id)">Отменить</button>
      </li>
    </ul>
  </template>

  <p v-else class="muted">Раздел «Мои регистрации» доступен студентам.</p>
</template>

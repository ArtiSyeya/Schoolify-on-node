<script setup>
import { ref, onMounted } from 'vue';
import { eventsService } from '../../services/events.service';

const events = ref([]);
const loading = ref(true);
const error = ref(null);

const STATUS = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликовано',
  CANCELLED: 'Отменено',
};

async function load() {
  loading.value = true;
  error.value = null;
  try {
    events.value = await eventsService.mine();
  } catch {
    error.value = 'Не удалось загрузить мероприятия';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function remove(e) {
  if (!confirm(`Удалить «${e.title}»? Все регистрации тоже удалятся.`)) return;
  try {
    await eventsService.remove(e.id);
    events.value = events.value.filter((x) => x.id !== e.id);
  } catch (err) {
    alert(err.response?.data?.error?.message || 'Ошибка удаления');
  }
}

const fmtDate = (d) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <div class="page-head">
    <h1>Мои мероприятия</h1>
    <router-link class="btn" :to="{ name: 'organizer-event-new' }">+ Создать</router-link>
  </div>

  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="!events.length" class="muted">У вас пока нет мероприятий.</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>Название</th>
        <th>Дата</th>
        <th>Статус</th>
        <th>Записано</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="e in events" :key="e.id">
        <td>{{ e.title }}</td>
        <td>{{ fmtDate(e.startsAt) }}</td>
        <td><span class="badge">{{ STATUS[e.status] }}</span></td>
        <td>{{ e.registeredCount }}<span v-if="e.capacity"> / {{ e.capacity }}</span></td>
        <td class="actions">
          <router-link :to="{ name: 'organizer-event-participants', params: { id: e.id } }">Участники</router-link>
          <router-link :to="{ name: 'organizer-event-edit', params: { id: e.id } }">Изменить</router-link>
          <a href="#" class="danger" @click.prevent="remove(e)">Удалить</a>
        </td>
      </tr>
    </tbody>
  </table>
</template>

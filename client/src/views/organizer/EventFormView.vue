<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { eventsService } from '../../services/events.service';

const route = useRoute();
const router = useRouter();
const id = route.params.id ? Number(route.params.id) : null;
const isEdit = computed(() => id !== null);

const form = ref({
  title: '',
  description: '',
  location: '',
  startsAt: '',
  capacity: 0,
  status: 'DRAFT',
});
const error = ref(null);
const saving = ref(false);
const loading = ref(isEdit.value);

const pad = (n) => String(n).padStart(2, '0');
function toLocalInput(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(async () => {
  if (!isEdit.value) return;
  try {
    const e = await eventsService.getById(id);
    form.value = {
      title: e.title,
      description: e.description || '',
      location: e.location || '',
      startsAt: e.startsAt ? toLocalInput(e.startsAt) : '',
      capacity: e.capacity,
      status: e.status,
    };
  } catch {
    error.value = 'Не удалось загрузить мероприятие';
  } finally {
    loading.value = false;
  }
});

async function submit() {
  error.value = null;
  saving.value = true;
  try {
    const payload = {
      ...form.value,
      capacity: Number(form.value.capacity),
      startsAt: form.value.startsAt ? new Date(form.value.startsAt).toISOString() : '',
    };
    if (isEdit.value) await eventsService.update(id, payload);
    else await eventsService.create(payload);
    router.push({ name: 'organizer-events' });
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <router-link :to="{ name: 'organizer-events' }" class="back">← К моим мероприятиям</router-link>
  <h1>{{ isEdit ? 'Редактирование мероприятия' : 'Новое мероприятие' }}</h1>

  <p v-if="loading">Загрузка…</p>
  <form v-else class="form" @submit.prevent="submit">
    <label>
      Название *
      <input v-model="form.title" required />
    </label>
    <label>
      Описание
      <textarea v-model="form.description" rows="4" />
    </label>
    <label>
      Место проведения
      <input v-model="form.location" />
    </label>
    <label>
      Дата и время начала *
      <input v-model="form.startsAt" type="datetime-local" required />
    </label>
    <label>
      Лимит мест (0 — без лимита)
      <input v-model.number="form.capacity" type="number" min="0" />
    </label>
    <label>
      Статус
      <select v-model="form.status">
        <option value="DRAFT">Черновик</option>
        <option value="PUBLISHED">Опубликовано</option>
        <option value="CANCELLED">Отменено</option>
      </select>
    </label>

    <p v-if="error" class="error">{{ error }}</p>
    <button class="btn" :disabled="saving">{{ saving ? '…' : 'Сохранить' }}</button>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { eventsService } from '../../services/events.service';
import { CATEGORIES } from '../../constants/categories';

const route = useRoute();
const router = useRouter();
const id = route.params.id ? Number(route.params.id) : null;
const isEdit = computed(() => id !== null);

const form = ref({
  title: '',
  organization: '',
  category: 'ECO',
  points: 0,
  description: '',
  startsAt: '',
  endsAt: '',
  capacity: 0,
  status: 'DRAFT',
});
const error = ref(null);
const saving = ref(false);
const loading = ref(isEdit.value);

const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, v]) => ({ key, label: v.label }));

const pad = (n) => String(n).padStart(2, '0');
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(async () => {
  if (!isEdit.value) return;
  try {
    const e = await eventsService.getById(id);
    form.value = {
      title: e.title,
      organization: e.organization || '',
      category: e.category || 'ECO',
      points: e.points || 0,
      description: e.description || '',
      startsAt: toLocalInput(e.startsAt),
      endsAt: toLocalInput(e.endsAt),
      capacity: e.capacity,
      status: e.status,
    };
  } catch {
    error.value = 'Не удалось загрузить событие';
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
      points: Number(form.value.points),
      capacity: Number(form.value.capacity),
      startsAt: form.value.startsAt ? new Date(form.value.startsAt).toISOString() : '',
      endsAt: form.value.endsAt ? new Date(form.value.endsAt).toISOString() : null,
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
  <a class="back" @click="router.push({ name: 'organizer-events' })">‹ К моим мероприятиям</a>
  <h1>{{ isEdit ? 'Редактирование' : 'Новое мероприятие' }}</h1>

  <p v-if="loading" class="muted">Загрузка…</p>
  <form v-else class="form" @submit.prevent="submit">
    <label>Название *<input v-model="form.title" required /></label>
    <label>Организация<input v-model="form.organization" placeholder="напр. Чистый город" /></label>
    <label>
      Категория
      <select v-model="form.category">
        <option v-for="c in CATEGORY_OPTIONS" :key="c.key" :value="c.key">{{ c.label }}</option>
      </select>
    </label>
    <label>Очки за участие<input v-model.number="form.points" type="number" min="0" /></label>
    <label>Описание<textarea v-model="form.description" rows="3" /></label>
    <label>Начало *<input v-model="form.startsAt" type="datetime-local" required /></label>
    <label>Окончание<input v-model="form.endsAt" type="datetime-local" /></label>
    <label>Лимит мест (0 — без лимита)<input v-model.number="form.capacity" type="number" min="0" /></label>
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

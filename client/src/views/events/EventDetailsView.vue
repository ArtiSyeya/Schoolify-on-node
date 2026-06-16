<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { eventsService } from '../../services/events.service';
import { registrationsService } from '../../services/registrations.service';
import { useUserStore } from '../../store/user';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const event = ref(null);
const loading = ref(true);
const error = ref(null);

const message = ref(null);
const actionError = ref(null);
const submitting = ref(false);

// Кнопка показывается гостю (для перехода ко входу) и студенту.
const canSee = computed(() => !store.isAuth || store.role === 'STUDENT');

async function load() {
  try {
    event.value = await eventsService.getById(route.params.id);
  } catch {
    error.value = 'Мероприятие не найдено';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function register() {
  if (!store.isAuth) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  message.value = null;
  actionError.value = null;
  submitting.value = true;
  try {
    await registrationsService.register(event.value.id);
    message.value = 'Вы успешно зарегистрированы!';
    await load(); // обновить количество свободных мест
  } catch (e) {
    actionError.value = e.response?.data?.error?.message || 'Не удалось записаться';
  } finally {
    submitting.value = false;
  }
}

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

    <button
      v-if="canSee"
      class="btn"
      :disabled="submitting || event.freeSeats === 0"
      @click="register"
    >
      {{ event.freeSeats === 0 ? 'Мест нет' : submitting ? '…' : 'Зарегистрироваться' }}
    </button>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="actionError" class="error">{{ actionError }}</p>
  </article>
</template>

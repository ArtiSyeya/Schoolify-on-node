<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { eventsService } from '../../services/events.service';
import { registrationsService } from '../../services/registrations.service';
import { useUserStore } from '../../store/user';
import { categoryMeta } from '../../constants/categories';
import { fmtRange } from '../../utils/format';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const event = ref(null);
const loading = ref(true);
const error = ref(null);
const myReg = ref(null); // активная регистрация текущего студента на это событие
const actionError = ref(null);
const submitting = ref(false);

const cat = computed(() => (event.value ? categoryMeta(event.value.category) : null));
const isStudent = computed(() => store.role === 'STUDENT');
const eventId = computed(() => Number(route.params.id));

async function loadEvent() {
  event.value = await eventsService.getById(eventId.value);
}

async function loadMyReg() {
  if (!isStudent.value) {
    myReg.value = null;
    return;
  }
  const mine = await registrationsService.my();
  myReg.value = mine.find((r) => r.event.id === eventId.value) || null;
}

onMounted(async () => {
  try {
    await Promise.all([loadEvent(), loadMyReg()]);
  } catch {
    error.value = 'Событие не найдено';
  } finally {
    loading.value = false;
  }
});

async function register() {
  if (!store.isAuth) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  actionError.value = null;
  submitting.value = true;
  try {
    await registrationsService.register(eventId.value);
    await Promise.all([loadEvent(), loadMyReg()]);
  } catch (e) {
    actionError.value = e.response?.data?.error?.message || 'Не удалось записаться';
  } finally {
    submitting.value = false;
  }
}

async function cancelReg() {
  actionError.value = null;
  submitting.value = true;
  try {
    await registrationsService.cancel(myReg.value.id);
    await Promise.all([loadEvent(), loadMyReg()]);
  } catch (e) {
    actionError.value = e.response?.data?.error?.message || 'Не удалось отменить';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <p v-if="loading" class="muted">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>

  <article v-else>
    <a class="back" @click="router.back()">‹ Назад</a>

    <div class="card" style="margin: 12px 0">
      <div class="tags" style="margin-bottom: 10px">
        <span class="pill" :style="{ background: cat.color, color: '#fff' }">{{ cat.label }}</span>
        <span v-if="event.points" class="pill pill-points">+{{ event.points }} pts</span>
      </div>
      <h1>{{ event.title }}</h1>
      <p class="muted">
        <template v-if="event.organization">{{ event.organization }} · </template>
        {{ fmtRange(event.startsAt, event.endsAt) }}
      </p>
      <p style="margin-top: 12px">{{ event.description }}</p>

      <div class="stats" style="margin-top: 16px">
        <div class="stat"><b>{{ event.freeSeats ?? '∞' }}</b><small>свободно</small></div>
        <div class="stat"><b>{{ event.capacity || '∞' }}</b><small>всего мест</small></div>
        <div class="stat"><b class="accent">+{{ event.points }}</b><small>очков</small></div>
      </div>
    </div>

    <!-- Уже записан: статус + отмена -->
    <template v-if="myReg">
      <div class="enrolled">✓ Вы зарегистрированы на это событие</div>
      <button class="btn btn-ghost btn-block" :disabled="submitting" @click="cancelReg">
        {{ submitting ? '…' : 'Отменить регистрацию' }}
      </button>
    </template>

    <!-- Не записан: кнопка регистрации (для студента и гостя) -->
    <button
      v-else-if="!store.isAuth || isStudent"
      class="btn btn-block"
      :disabled="submitting || event.freeSeats === 0"
      @click="register"
    >
      {{ event.freeSeats === 0 ? 'Мест нет' : submitting ? '…' : 'Зарегистрироваться' }}
    </button>

    <p v-if="actionError" class="error" style="margin-top: 12px">{{ actionError }}</p>
  </article>
</template>

<style scoped>
.enrolled {
  background: rgba(95, 174, 49, 0.15);
  border: 1px solid rgba(95, 174, 49, 0.4);
  color: var(--primary);
  border-radius: 10px;
  padding: 12px 14px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { profileService } from '../../services/profile.service';
import { registrationsService } from '../../services/registrations.service';
import { useUserStore } from '../../store/user';
import { initials, fmtMonthYear, fmtDay } from '../../utils/format';

const store = useUserStore();
const router = useRouter();

const profile = ref(null);
const registrations = ref([]);
const loading = ref(true);

const editing = ref(false);
const form = ref({ fullName: '', phone: '' });
const saving = ref(false);

const progress = computed(() => {
  const p = profile.value;
  if (!p || !p.nextThreshold) return 100;
  const span = p.nextThreshold - p.currentThreshold;
  return Math.min(100, Math.round(((p.points - p.currentThreshold) / span) * 100));
});

async function load() {
  loading.value = true;
  profile.value = await profileService.get();
  form.value = { fullName: profile.value.fullName, phone: profile.value.phone || '' };
  if (store.role === 'STUDENT') registrations.value = await registrationsService.my();
  loading.value = false;
}

onMounted(load);

async function save() {
  saving.value = true;
  try {
    await profileService.update(form.value);
    editing.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}

async function cancel(id) {
  await registrationsService.cancel(id);
  registrations.value = registrations.value.filter((r) => r.id !== id);
  profile.value = await profileService.get();
}

function logout() {
  store.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <p v-if="loading" class="muted">Загрузка…</p>

  <template v-else-if="profile">
    <header class="page-head">
      <h1>Профиль</h1>
      <a class="green" style="cursor: pointer" @click="editing = !editing">
        {{ editing ? 'Отмена' : 'Изменить профиль' }}
      </a>
    </header>

    <div class="card" style="text-align: center">
      <span class="avatar accent" style="width: 72px; height: 72px; font-size: 26px; margin-bottom: 10px">
        {{ initials(profile.fullName) }}
      </span>
      <h2>{{ profile.fullName }}</h2>
      <span class="pill" style="background: var(--primary); color: #fff">{{ profile.level }}</span>
      <p class="muted" style="margin-top: 8px">Участник с: {{ fmtMonthYear(profile.memberSince) }}</p>

      <form v-if="editing" class="form" style="margin-top: 14px; text-align: left" @submit.prevent="save">
        <label class="field">Имя<input v-model="form.fullName" class="input" /></label>
        <label class="field">Телефон<input v-model="form.phone" class="input" placeholder="+7 …" /></label>
        <button class="btn btn-block" :disabled="saving">{{ saving ? '…' : 'Сохранить' }}</button>
      </form>
    </div>

    <div class="stats" style="grid-template-columns: repeat(4, 1fr); margin-top: 14px">
      <div class="stat"><b>{{ profile.hours }}</b><small>часов</small></div>
      <div class="stat"><b>{{ profile.eventsCount }}</b><small>событий</small></div>
      <div class="stat"><b>{{ profile.points }}</b><small>очков</small></div>
      <div class="stat"><b class="accent">#{{ profile.rank ?? '—' }}</b><small>место</small></div>
    </div>

    <h3 class="section-title">Прогресс до уровня «{{ profile.nextLevel || profile.level }}»</h3>
    <div class="progress"><span :style="{ width: progress + '%' }" /></div>
    <small class="muted">{{ profile.points }} / {{ profile.nextThreshold || profile.points }} pts</small>

    <h3 class="section-title">Мои значки</h3>
    <div class="badges">
      <div v-for="b in profile.badges" :key="b.key" class="badge-cell" :class="{ earned: b.earned }">
        {{ b.name }}
      </div>
    </div>

    <h3 class="section-title">Недавняя активность</h3>
    <p v-if="!profile.recentActivity.length" class="muted">Пока нет активности.</p>
    <div v-for="a in profile.recentActivity" :key="a.id" class="row">
      <div>
        <strong>{{ a.title }}</strong>
        <p class="muted" style="margin: 2px 0 0">{{ fmtDay(a.date) }}</p>
      </div>
      <span class="pill pill-points">+{{ a.points }} pts</span>
    </div>

    <template v-if="store.role === 'STUDENT' && registrations.length">
      <h3 class="section-title">Мои записи</h3>
      <div v-for="r in registrations" :key="r.id" class="row">
        <div>
          <strong>{{ r.event.title }}</strong>
          <p class="muted" style="margin: 2px 0 0">{{ fmtDay(r.event.startsAt) }}</p>
        </div>
        <span v-if="r.attended" class="badge attended">✓ Засчитано</span>
        <button v-else class="btn btn-ghost" @click="cancel(r.id)">Отменить</button>
      </div>
    </template>

    <h3 class="section-title">Управление</h3>
    <router-link v-if="['ORGANIZER', 'ADMIN'].includes(store.role)" to="/organizer/events" class="row">
      <strong>Мои мероприятия</strong><span class="chev">›</span>
    </router-link>
    <router-link v-if="store.role === 'ADMIN'" to="/admin/users" class="row">
      <strong>Управление пользователями</strong><span class="chev">›</span>
    </router-link>
    <button class="btn btn-ghost btn-block" style="margin-top: 8px" @click="logout">Выйти</button>
  </template>
</template>

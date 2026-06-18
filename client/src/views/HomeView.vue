<script setup>
import { ref, onMounted, computed } from 'vue';
import { profileService } from '../services/profile.service';
import { eventsService } from '../services/events.service';
import { registrationsService } from '../services/registrations.service';
import { useUserStore } from '../store/user';
import { initials } from '../utils/format';
import EventCard from '../components/EventCard.vue';

const store = useUserStore();
const profile = ref(null);
const upcoming = ref([]);
const loading = ref(true);

const firstName = computed(() => (profile.value?.fullName || store.user?.fullName || '').split(' ')[0] || '');
const progress = computed(() => {
  const p = profile.value;
  if (!p || !p.nextThreshold) return 100;
  const span = p.nextThreshold - p.currentThreshold;
  return Math.min(100, Math.round(((p.points - p.currentThreshold) / span) * 100));
});

onMounted(async () => {
  try {
    profile.value = await profileService.get();
    const regs = await registrationsService.my();
    const now = Date.now();
    upcoming.value = regs
      .map((r) => r.event)
      .filter((e) => new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    // подтянем полные карточки (с категорией/очками) из списка событий
    const all = await eventsService.list();
    const byId = Object.fromEntries(all.map((e) => [e.id, e]));
    upcoming.value = upcoming.value.map((e) => byId[e.id] || e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <header class="page-head">
    <div>
      <h1 class="green">Schoolify</h1>
      <small class="muted">Волонтёрская программа</small>
    </div>
    <span class="avatar accent" style="width: 42px; height: 42px">{{ initials(profile?.fullName || store.user?.fullName) }}</span>
  </header>

  <p v-if="loading" class="muted">Загрузка…</p>

  <template v-else-if="profile">
    <div class="card" style="margin: 14px 0">
      <h2>Привет, {{ firstName }}!</h2>
      <p class="green" style="margin: 4px 0 12px">
        <template v-if="profile.toNextLevel">{{ profile.toNextLevel }} очков до уровня «{{ profile.nextLevel }}»</template>
        <template v-else>Максимальный уровень достигнут!</template>
      </p>
      <div class="progress"><span :style="{ width: progress + '%' }" /></div>
      <small class="muted">{{ profile.points }} / {{ profile.nextThreshold || profile.points }} pts</small>
    </div>

    <div class="stats">
      <div class="stat"><b>{{ profile.hours }}ч</b><small>часов</small></div>
      <div class="stat"><b>{{ profile.eventsCount }}</b><small>событий</small></div>
      <div class="stat"><b class="accent">#{{ profile.rank ?? '—' }}</b><small>место</small></div>
    </div>

    <h3 class="section-title">Ближайшие события</h3>
    <p v-if="!upcoming.length" class="muted">Вы пока не записаны на предстоящие события.</p>
    <EventCard v-for="e in upcoming" :key="e.id" :event="e" />
  </template>
</template>

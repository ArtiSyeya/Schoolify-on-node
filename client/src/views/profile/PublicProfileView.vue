<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { profileService } from '../../services/profile.service';
import { initials, fmtMonthYear, fmtDay } from '../../utils/format';

const route = useRoute();
const router = useRouter();

const profile = ref(null);
const loading = ref(true);
const error = ref(null);

const progress = computed(() => {
  const p = profile.value;
  if (!p || !p.nextThreshold) return 100;
  const span = p.nextThreshold - p.currentThreshold;
  return Math.min(100, Math.round(((p.points - p.currentThreshold) / span) * 100));
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    profile.value = await profileService.getById(route.params.id);
  } catch (e) {
    error.value = e.response?.data?.error?.message || 'Профиль не найден';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<template>
  <a class="back" @click="router.back()">‹ Назад</a>

  <p v-if="loading" class="muted">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>

  <template v-else-if="profile">
    <div class="card" style="text-align: center; margin-top: 8px">
      <span class="avatar accent" style="width: 72px; height: 72px; font-size: 26px; margin-bottom: 10px">
        {{ initials(profile.fullName) }}
      </span>
      <h2>{{ profile.fullName }}</h2>
      <span class="pill" style="background: var(--primary); color: #fff">{{ profile.level }}</span>
      <p class="muted" style="margin-top: 8px">Участник с: {{ fmtMonthYear(profile.memberSince) }}</p>
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

    <h3 class="section-title">Значки</h3>
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
  </template>
</template>

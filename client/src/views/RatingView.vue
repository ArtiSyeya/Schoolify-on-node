<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ratingService } from '../services/rating.service';
import { useUserStore } from '../store/user';
import { initials, shortName } from '../utils/format';

const store = useUserStore();
const router = useRouter();

// свой профиль — на вкладку «Профиль», чужой — на публичную страницу
function openProfile(userId) {
  if (userId === store.user?.id) router.push({ name: 'profile' });
  else router.push({ name: 'public-profile', params: { id: userId } });
}
const period = ref('month');
const data = ref(null);
const loading = ref(true);

const PERIODS = [
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'all', label: 'За всё время' },
];

const top3 = computed(() => data.value?.items.slice(0, 3) || []);
const rest = computed(() => data.value?.items.slice(3) || []);
// порядок на подиуме: #2, #1, #3
const podium = computed(() => {
  const t = top3.value;
  return [t[1], t[0], t[2]].filter(Boolean).map((row) => ({ ...row, center: row.rank === 1 }));
});

async function load() {
  loading.value = true;
  data.value = await ratingService.get(period.value);
  loading.value = false;
}

onMounted(load);

function setPeriod(p) {
  period.value = p;
  load();
}
</script>

<template>
  <h1>Рейтинг волонтёров</h1>

  <div class="chips" style="margin: 14px 0">
    <span
      v-for="p in PERIODS"
      :key="p.key"
      class="chip"
      :class="{ active: period === p.key }"
      @click="setPeriod(p.key)"
    >
      {{ p.label }}
    </span>
  </div>

  <p v-if="loading" class="muted">Загрузка…</p>

  <template v-else-if="data">
    <div class="podium">
      <div
        v-for="row in podium"
        :key="row.userId"
        class="podium-col"
        :class="{ center: row.center }"
        style="cursor: pointer"
        @click="openProfile(row.userId)"
      >
        <span class="avatar" :class="{ accent: row.center }" :style="{ width: row.center ? '56px' : '46px', height: row.center ? '56px' : '46px' }">
          {{ initials(row.fullName) }}
        </span>
        <div class="podium-bar" :class="{ center: row.center }">
          <b>#{{ row.rank }}</b>
          <small>{{ shortName(row.fullName) }}</small>
          <small class="muted">{{ row.points }} pts</small>
        </div>
      </div>
    </div>

    <h3 class="section-title">Все участники</h3>
    <div v-for="row in rest" :key="row.userId" class="row" style="cursor: pointer" @click="openProfile(row.userId)">
      <div style="display: flex; align-items: center; gap: 12px">
        <span class="muted" style="width: 28px">#{{ row.rank }}</span>
        <span class="avatar" style="width: 34px; height: 34px; font-size: 13px">{{ initials(row.fullName) }}</span>
        <div>
          <strong>{{ shortName(row.fullName) }}</strong>
          <p class="muted" style="margin: 2px 0 0">{{ row.hours }}ч</p>
        </div>
      </div>
      <span class="green">{{ row.points }} pts</span>
    </div>

    <div v-if="data.me" class="me-card">
      <div style="display: flex; align-items: center; gap: 12px">
        <b class="accent">#{{ data.me.rank }}</b>
        <strong>{{ shortName(data.me.fullName) }}</strong>
      </div>
      <div style="text-align: right">
        <small class="muted">Твоё место</small>
        <div>{{ data.me.points }} pts</div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}
.podium-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 130px;
}
.podium-bar {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px 12px 0 0;
  padding: 12px 8px;
  text-align: center;
  height: 96px;
}
.podium-bar.center {
  height: 124px;
  background: var(--primary);
  border-color: var(--primary);
}
.podium-bar b {
  display: block;
  font-size: 18px;
}
.podium-bar small {
  display: block;
  font-size: 12px;
}
.podium-col.center {
  order: 0;
}
.me-card {
  position: sticky;
  bottom: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--primary-dark);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 16px;
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { eventsService } from '../../services/events.service';
import { CATEGORY_FILTERS } from '../../constants/categories';
import EventCard from '../../components/EventCard.vue';

const events = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');
const category = ref('ALL');

let debounce;

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const params = {};
    if (category.value !== 'ALL') params.category = category.value;
    if (search.value.trim()) params.search = search.value.trim();
    events.value = await eventsService.list(params);
  } catch {
    error.value = 'Не удалось загрузить события';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(category, load);
watch(search, () => {
  clearTimeout(debounce);
  debounce = setTimeout(load, 300);
});
</script>

<template>
  <h1>События</h1>

  <input v-model="search" class="input" placeholder="Поиск событий…" style="margin: 12px 0" />

  <div class="chips">
    <span
      v-for="c in CATEGORY_FILTERS"
      :key="c.key"
      class="chip"
      :class="{ active: category === c.key }"
      @click="category = c.key"
    >
      {{ c.label }}
    </span>
  </div>

  <div class="page-head">
    <small class="muted">Сортировка: по дате</small>
    <small class="green">{{ events.length }} событий</small>
  </div>

  <p v-if="loading" class="muted">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="!events.length" class="muted">Ничего не найдено.</p>
  <EventCard v-for="e in events" :key="e.id" :event="e" />
</template>

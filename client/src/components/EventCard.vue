<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { categoryMeta } from '../constants/categories';
import { fmtRange, isFinished } from '../utils/format';

const props = defineProps({ event: { type: Object, required: true } });
const router = useRouter();

const cat = computed(() => categoryMeta(props.event.category));
const finished = computed(() => isFinished(props.event));

function open() {
  router.push({ name: 'event-details', params: { id: props.event.id } });
}
</script>

<template>
  <div class="event-card" :class="{ finished }" :style="{ borderLeftColor: cat.color }" @click="open">
    <div class="body">
      <h3>{{ event.title }}</h3>
      <p class="meta">
        <template v-if="event.organization">{{ event.organization }} · </template>
        {{ fmtRange(event.startsAt, event.endsAt) }}
      </p>
      <div class="tags">
        <span class="pill" :style="{ background: cat.color, color: '#fff' }">{{ cat.label }}</span>
        <span v-if="event.points" class="pill pill-points">+{{ event.points }} pts</span>
        <span v-if="finished" class="pill pill-done">Завершено</span>
      </div>
    </div>
    <span v-if="!finished && event.freeSeats !== null" class="seats">{{ event.freeSeats }} мест</span>
    <span class="chev">›</span>
  </div>
</template>

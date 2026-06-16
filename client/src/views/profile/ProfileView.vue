<script setup>
import { useUserStore } from '../../store/user';

const store = useUserStore();
</script>

<template>
  <h1>Личный кабинет</h1>
  <p><strong>{{ store.user?.fullName }}</strong> · {{ store.user?.email }}</p>
  <p>Роль: <span class="badge">{{ store.role }}</span></p>
  <p class="muted">Раздел «Мои регистрации» — в разработке (feature/registrations).</p>
</template>

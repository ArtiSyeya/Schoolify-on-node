<script setup>
import { ref, onMounted } from 'vue';
import { adminService } from '../../services/admin.service';
import { useUserStore } from '../../store/user';

const store = useUserStore();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');

const ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];

async function load() {
  loading.value = true;
  error.value = null;
  try {
    users.value = await adminService.listUsers(search.value ? { search: search.value } : {});
  } catch {
    error.value = 'Не удалось загрузить пользователей';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function changeRole(user, role) {
  try {
    await adminService.setRole(user.id, role);
    user.role = role;
  } catch (e) {
    alert(e.response?.data?.error?.message || 'Ошибка');
    await load();
  }
}

async function toggleBlock(user) {
  try {
    const res = await adminService.setBlocked(user.id, !user.isBlocked);
    user.isBlocked = res.isBlocked;
  } catch (e) {
    alert(e.response?.data?.error?.message || 'Ошибка');
  }
}

const isSelf = (id) => id === store.user?.id;
</script>

<template>
  <h1>Управление пользователями</h1>

  <form class="toolbar" @submit.prevent="load">
    <input v-model="search" placeholder="Поиск по имени или email" />
    <button class="btn" type="submit">Найти</button>
  </form>

  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">{{ error }}</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Имя</th>
        <th>Email</th>
        <th>Роль</th>
        <th>Статус</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="u in users" :key="u.id">
        <td>{{ u.id }}</td>
        <td>{{ u.fullName }}<span v-if="isSelf(u.id)" class="muted"> (вы)</span></td>
        <td>{{ u.email }}</td>
        <td>
          <select
            :value="u.role"
            :disabled="isSelf(u.id)"
            @change="changeRole(u, $event.target.value)"
          >
            <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
          </select>
        </td>
        <td>
          <span class="badge" :class="{ blocked: u.isBlocked }">
            {{ u.isBlocked ? 'Заблокирован' : 'Активен' }}
          </span>
        </td>
        <td>
          <button
            class="btn btn-secondary"
            :disabled="isSelf(u.id)"
            @click="toggleBlock(u)"
          >
            {{ u.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

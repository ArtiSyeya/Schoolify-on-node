import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';
import DefaultLayout from '../layouts/DefaultLayout.vue';

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'events', name: 'events', component: () => import('../views/events/EventsListView.vue') },
      {
        path: 'events/:id',
        name: 'event-details',
        component: () => import('../views/events/EventDetailsView.vue'),
      },
      { path: 'login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
      {
        path: 'profile',
        name: 'profile',
        meta: { requiresAuth: true },
        component: () => import('../views/profile/ProfileView.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Защита маршрутов по авторизации (роли подключатся на следующих этапах).
router.beforeEach((to) => {
  const store = useUserStore();
  if (to.meta.requiresAuth && !store.isAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});

export default router;

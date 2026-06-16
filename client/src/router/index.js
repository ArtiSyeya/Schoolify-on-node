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
      {
        path: 'organizer/events',
        name: 'organizer-events',
        meta: { requiresAuth: true, roles: ['ORGANIZER', 'ADMIN'] },
        component: () => import('../views/organizer/OrganizerEventsView.vue'),
      },
      {
        path: 'organizer/events/new',
        name: 'organizer-event-new',
        meta: { requiresAuth: true, roles: ['ORGANIZER', 'ADMIN'] },
        component: () => import('../views/organizer/EventFormView.vue'),
      },
      {
        path: 'organizer/events/:id/edit',
        name: 'organizer-event-edit',
        meta: { requiresAuth: true, roles: ['ORGANIZER', 'ADMIN'] },
        component: () => import('../views/organizer/EventFormView.vue'),
      },
      {
        path: 'organizer/events/:id/participants',
        name: 'organizer-event-participants',
        meta: { requiresAuth: true, roles: ['ORGANIZER', 'ADMIN'] },
        component: () => import('../views/organizer/EventParticipantsView.vue'),
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        meta: { requiresAuth: true, roles: ['ADMIN'] },
        component: () => import('../views/admin/AdminUsersView.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Защита маршрутов: авторизация и роль.
router.beforeEach((to) => {
  const store = useUserStore();
  if (to.meta.requiresAuth && !store.isAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.roles && !to.meta.roles.includes(store.role)) {
    return { name: 'home' };
  }
});

export default router;

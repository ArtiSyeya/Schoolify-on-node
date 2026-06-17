import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';
import AppLayout from '../layouts/AppLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', meta: { requiresAuth: true }, component: () => import('../views/HomeView.vue') },
      { path: 'events', name: 'events', component: () => import('../views/events/EventsListView.vue') },
      {
        path: 'events/:id',
        name: 'event-details',
        component: () => import('../views/events/EventDetailsView.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        meta: { requiresAuth: true },
        component: () => import('../views/profile/ProfileView.vue'),
      },
      {
        path: 'rating',
        name: 'rating',
        meta: { requiresAuth: true },
        component: () => import('../views/RatingView.vue'),
      },
      {
        path: 'users/:id',
        name: 'public-profile',
        meta: { requiresAuth: true },
        component: () => import('../views/profile/PublicProfileView.vue'),
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
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
      { path: 'register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
];

const router = createRouter({ history: createWebHistory(), routes });

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

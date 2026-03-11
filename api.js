// src/services/api.js — Todas as chamadas ao backend ALTAR
import * as SecureStore from 'expo-secure-store';

// ⚠️ Mude para o IP da sua máquina quando testar no celular físico
// Ex: 'http://192.168.1.100:3001/api'
// No simulador iOS/Android use:
export const API_URL = 'http://192.168.15.37:3001/api';

let _token = null;

export async function getToken() {
  if (_token) return _token;
  _token = await SecureStore.getItemAsync('altar_token');
  return _token;
}

export async function setToken(token) {
  _token = token;
  await SecureStore.setItemAsync('altar_token', token);
}

export async function clearToken() {
  _token = null;
  await SecureStore.deleteItemAsync('altar_token');
}

async function apiFetch(path, opts = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_URL + path, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name, username, email, password) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, username, email, password }) }),
  me: () => apiFetch('/auth/me'),
};

// ── POSTS ─────────────────────────────────────────────────────────────────────
export const postsAPI = {
  feed: () => apiFetch('/posts'),
  create: (content, image) =>
    apiFetch('/posts', { method: 'POST', body: JSON.stringify({ content, image }) }),
  like: (id) => apiFetch('/posts/' + id + '/like', { method: 'POST' }),
  save: (id) => apiFetch('/posts/' + id + '/save', { method: 'POST' }),
  comment: (id, text) =>
    apiFetch('/posts/' + id + '/comment', { method: 'POST', body: JSON.stringify({ text }) }),
  userPosts: (userId) => apiFetch('/posts/user/' + userId),
};

// ── EVENTS ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  list: () => apiFetch('/events'),
  saved: () => apiFetch('/events/saved'),
  detail: (id) => apiFetch('/events/' + id),
  save: (id) => apiFetch('/events/' + id + '/save', { method: 'POST' }),
};

// ── MESSAGES ──────────────────────────────────────────────────────────────────
export const messagesAPI = {
  conversations: () => apiFetch('/messages'),
  messages: (convId) => apiFetch('/messages/' + convId),
  send: (convId, text) =>
    apiFetch('/messages/' + convId + '/send', { method: 'POST', body: JSON.stringify({ text }) }),
  startConversation: (toUserId) =>
    apiFetch('/messages', { method: 'POST', body: JSON.stringify({ toUserId }) }),
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  search: (q) => apiFetch('/users/search?q=' + encodeURIComponent(q)),
  profile: (id) => apiFetch('/users/' + id),
  follow: (id) => apiFetch('/users/' + id + '/follow', { method: 'POST' }),
  updateMe: (data) => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => apiFetch('/notifications'),
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
export function formatTimeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return min + 'min';
  const h = Math.floor(min / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

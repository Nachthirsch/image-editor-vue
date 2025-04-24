import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Import pages
import EditPage from './pages/EditPage.vue'
import GalleryPage from './pages/GalleryPage.vue'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/edit' },
    { path: '/edit', component: EditPage },
    { path: '/gallery', component: GalleryPage }
  ]
})

// Create pinia instance
const pinia = createPinia()

// Create app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')

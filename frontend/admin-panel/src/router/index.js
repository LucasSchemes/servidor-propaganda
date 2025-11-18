import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'

// rotas do aplicativo
const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView // tela de login
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView // painel administrativo
  }
]

// cria o roteador com o histórico baseado na web
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes 
})

export default router
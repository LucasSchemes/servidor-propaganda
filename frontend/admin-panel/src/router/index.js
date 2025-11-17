import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'

// rotas do aplicativo
const routes = [
  {
    path: '/', // rota login
    name: 'login',
    component: LoginView // componente da view de login
  },
  {
    path: '/admin', //rota admin
    name: 'admin',
    component: AdminView // componente da view admin
  }
]

// cria o roteador com o histórico baseado na web
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes 
})

export default router
import { createRouter, createWebHistory } from 'vue-router'

// Vamos importar nossas futuras "páginas" (View components)
// Elas ainda não existem, mas vamos criá-las a seguir.
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'

// 1. Definição das Rotas
const routes = [
  {
    path: '/', // A rota raiz (ex: http://localhost:5173/)
    name: 'login',
    component: LoginView // Mostra o componente de Login
  },
  {
    path: '/admin', // A rota do painel (ex: http://localhost:5173/admin)
    name: 'admin',
    component: AdminView // Mostra o componente do Admin
    // TODO: Adicionar um "guarda de navegação" aqui
  }
  // Removemos as rotas '/about' e '/home' que vieram no exemplo
]

// 2. Criação da instância do Roteador
const router = createRouter({
  /*
    'createWebHistory' usa URLs "limpas" (ex: /admin).
    A alternativa seria 'createWebHashHistory' (ex: /#/admin),
    mas o 'WebHistory' é mais moderno.
  */
  history: createWebHistory(import.meta.env.BASE_URL),
  routes // Passa o array de rotas que definimos acima
})

// 3. Exporta o roteador para o Vue usar
export default router
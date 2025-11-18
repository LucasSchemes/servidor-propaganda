<template>
  <div>
    <header class="admin-header">
      <h1>Painel Administrativo</h1>
      <button id="logout-button" @click="handleLogout">Sair</button>
    </header>

    <main class="admin-container">
      <SlideForm
        :slide-para-editar="slideParaEditar"
        @slide-salvo="carregarSlides"
        @edicao-cancelada="slideParaEditar = null"
      />

      <SlideList :slides="slides" @editar="prepararEdicao" @deletar="handleDelete" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Importa os componentes
import SlideForm from '../components/slideForm.vue'
import SlideList from '../components/slideList.vue'

// URLs da API
const API_URL = 'http://localhost:4000/api/slides/slides'
const LOGOUT_URL = 'http://localhost:4000/api/auth/logout'

// Acesso ao Roteador
const router = useRouter()

// Estado Reativo
const slides = ref([])
const slideParaEditar = ref(null)

// Função para carregar os slides
const carregarSlides = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      credentials: 'include'
    })

    if (response.status === 401 || response.status === 403) {
      router.push('/')
      return
    }

    if (!response.ok) {
      throw new Error('Falha ao carregar slides.')
    }

    // Atualiza a lista de slides com os dados recebidos
    slides.value = await response.json()
    // Limpa o formulário caso uma edição tenha sido concluída
    slideParaEditar.value = null
  } catch (error) {
    console.error('Erro ao carregar slides:', error)
  }
}

// Função para Deletar
const handleDelete = async (id) => {
  if (!confirm(`Tem certeza que deseja remover este slide?`)) {
    return
  }
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Falha ao deletar o slide.')
    }
    // Recarrega a lista de slides após a deleção
    await carregarSlides()
  } catch (error) {
    console.error('Erro ao deletar:', error)
    alert(`Erro: ${error.message}`)
  }
}

// Função de Logout
const handleLogout = async () => {
  try {
    await fetch(LOGOUT_URL, {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  } finally {
    router.push('/')
  }
}

// Função para preparar a edição
const prepararEdicao = (slide) => {
  slideParaEditar.value = slide
}

// Hook de Ciclo de Vida
onMounted(() => {
  carregarSlides()
})
</script>

<style scoped>
.admin-header {
  width: 100%;
  background-color: #333;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
}
.admin-header h1 {
  margin: 0;
  font-size: 1.5rem;
}
#logout-button {
  background-color: #d93025;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
#logout-button:hover {
  background-color: #b0261e;
}

.admin-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  box-sizing: border-box;
}
</style>
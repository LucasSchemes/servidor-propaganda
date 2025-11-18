<template>
  <section class="form-section">
    <h2 id="form-title">{{ formTitle }}</h2>

    <form id="slide-form" @submit.prevent="handleSave">
      <div class="form-group">
        <label for="titulo">Título</label>
        <input type="text" id="titulo" v-model="form.titulo" required />
      </div>

      <div class="form-group-inline">
        <div class="form-group">
          <label for="duracao">Duração (segundos)</label>
          <input type="number" id="duracao" v-model.number="form.duracao" min="1" required />
        </div>
        <div class="form-group">
          <label for="dataExpiracao">Data de Expiração</label>
          <input type="datetime-local" id="dataExpiracao" v-model="form.dataExpiracao" required />
        </div>
      </div>

      <div class="form-group">
        <label for="conteudoHTML">Conteúdo HTML</label>
        <textarea id="conteudoHTML" rows="10" v-model="form.conteudoHTML" required></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" id="save-button">Salvar</button>
        <button
          type="button"
          id="cancel-button"
          class="button-secondary"
          v-if="editingSlideId"
          @click="resetarFormulario"
        >
          Cancelar Edição
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

// URLs da API
const API_URL = 'http://localhost:4000/api/slides/slides'

// Props (dados recebidos do AdminView)
const props = defineProps({
  slideParaEditar: {
    type: Object,
    default: null
  }
})

// Emits (eventos enviados para o AdminView)
const emit = defineEmits(['slide-salvo', 'edicao-cancelada'])

// Estado Reativo
const formTitle = ref('Criar Novo Slide')
const editingSlideId = ref(null)
const form = ref({
  titulo: '',
  duracao: 10,
  dataExpiracao: '',
  conteudoHTML: ''
})

// Lógica de Salvar
const handleSave = async () => {
  let url = API_URL
  let method = 'POST'

  if (editingSlideId.value) {
    url = `${API_URL}/${editingSlideId.value}`
    method = 'PUT'
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.message || 'Erro ao salvar slide')
    }

    resetarFormulario()
    emit('slide-salvo')
  } catch (error) {
    console.error('Erro ao salvar slide:', error)
    alert(`Erro: ${error.message}`)
  }
}

// Funções Auxiliares
const resetarFormulario = () => {
  formTitle.value = 'Criar Novo Slide'
  editingSlideId.value = null
  form.value = {
    titulo: '',
    duracao: 10,
    dataExpiracao: '',
    conteudoHTML: ''
  }
  emit('edicao-cancelada')
}

// Observador
// Quando 'slideParaEditar' mudar, atualiza o formulário
watch(
  () => props.slideParaEditar,
  (novoSlide) => {
    if (novoSlide) {
      // Se um slide foi passado, preenche o formulário
      formTitle.value = 'Editando Slide'
      editingSlideId.value = novoSlide._id

      const data = new Date(novoSlide.dataExpiracao)
      data.setMinutes(data.getMinutes() - data.getTimezoneOffset())

      form.value = {
        titulo: novoSlide.titulo,
        duracao: novoSlide.duracao,
        dataExpiracao: data.toISOString().slice(0, 16),
        conteudoHTML: novoSlide.conteudoHTML
      }

      window.scrollTo(0, 0)
    } else {
      resetarFormulario()
    }
  }
)
</script>

<style scoped>
.form-section {
  flex: 1;
  min-width: 400px;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
}
h2 {
  color: #333;
  margin-top: 0;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}
.form-group input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
}
textarea {
  resize: vertical;
}
.form-group-inline {
  display: flex;
  gap: 1rem;
}
.form-group-inline .form-group {
  flex: 1;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Botões (copiados do AdminView) */
button {
  padding: 0.85rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
button:hover {
  background-color: #0056b3;
}
.button-secondary {
  background-color: #6c757d;
}
.button-secondary:hover {
  background-color: #5a6268;
}
</style>
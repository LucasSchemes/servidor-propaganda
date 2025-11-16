<template>
  <div>
    <header class="admin-header">
      <h1>Painel Administrativo</h1>
      <button id="logout-button" @click="handleLogout">Sair</button>
    </header>

    <main class="admin-container">

      <section class="form-section">
        <h2 id="form-title">{{ formTitle }}</h2>
        
        <form id="slide-form" @submit.prevent="handleSave">

          <div class="form-group">
            <label for="titulo">Título</label>
            <input type="text" id="titulo" v-model="form.titulo" required>
          </div>
          
          <div class="form-group-inline">
            <div class="form-group">
              <label for="duracao">Duração (segundos)</label>
              <input type="number" id="duracao" v-model.number="form.duracao" min="1" required>
            </div>
            <div class="form-group">
              <label for="dataExpiracao">Data de Expiração</label>
              <input type="datetime-local" id="dataExpiracao" v-model="form.dataExpiracao" required>
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

      <section class="list-section">
        <h2>Slides Cadastrados</h2>
        
        <div v-if="slides.length === 0">
          <p>Nenhum slide cadastrado.</p>
        </div>

        <div id="slide-list" v-else>
          <div class="slide-item" v-for="slide in slides" :key="slide._id" :class="{ 'slide-expirado': isExpirado(slide.dataExpiracao) }">
            <h3>{{ slide.titulo }}</h3>
            <div class="slide-info">
              <p><strong>Duração:</strong> {{ slide.duracao }} segundos</p>
              <p><strong>Expira em:</strong> {{ formatarData(slide.dataExpiracao) }}</p>
            </div>
            <div class="slide-actions">
              <button class="edit-btn" @click="prepararEdicao(slide)">Editar</button>
              <button class="delete-btn" @click="handleDelete(slide._id)">Remover</button>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 1. URLs da API
const API_URL = 'http://localhost:4000/api/slides/slides';
const LOGOUT_URL = 'http://localhost:4000/api/auth/logout';

// 2. Acesso ao Roteador
const router = useRouter();

// 3. Estado Reativo (os "dados" do componente)
const slides = ref([]); // Guarda a lista de slides
const formTitle = ref('Criar Novo Slide');
const editingSlideId = ref(null); // Guarda o ID do slide sendo editado

// 'ref' para o objeto do formulário
const form = ref({
  titulo: '',
  duracao: 10,
  dataExpiracao: '',
  conteudoHTML: ''
});

// 4. Função para carregar os slides (LER do CRUD)
// Esta função é chamada assim que o componente é "montado" (onMounted)
const carregarSlides = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      credentials: 'include' // Envia o cookie de autenticação
    });

    // === VERIFICAÇÃO DE SEGURANÇA ===
    // Se o backend nos expulsar (não somos admin)
    if (response.status === 401 || response.status === 403) {
      console.warn('Não autorizado. Redirecionando para login.');
      router.push('/'); // Redireciona para a página de login
      return;
    }
    
    if (!response.ok) {
      throw new Error('Falha ao carregar slides.');
    }

    // Atualiza o 'ref' de slides. O Vue irá
    // atualizar o HTML (o v-for) automaticamente.
    slides.value = await response.json();

  } catch (error) {
    console.error('Erro ao carregar slides:', error);
    // (Numa app real, mostraríamos um erro para o usuário)
  }
};

// 5. Função para Salvar (CRIAR ou ATUALIZAR do CRUD)
const handleSave = async () => {
  let url = API_URL;
  let method = 'POST'; // Padrão: Criar

  // Se temos um ID, estamos ATUALIZANDO (PUT)
  if (editingSlideId.value) {
    url = `${API_URL}/${editingSlideId.value}`;
    method = 'PUT';
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Envia o cookie de admin
      body: JSON.stringify(form.value) // Envia os dados do formulário
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Erro ao salvar slide');
    }
    
    // Sucesso!
    resetarFormulario();
    await carregarSlides(); // Recarrega a lista

  } catch (error) {
    console.error('Erro ao salvar slide:', error);
    alert(`Erro: ${error.message}`);
  }
};

// 6. Função para Deletar (DELETAR do CRUD)
const handleDelete = async (id) => {
  if (!confirm(`Tem certeza que deseja remover este slide?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include' // Envia o cookie de admin
    });

    if (!response.ok) {
      throw new Error('Falha ao deletar o slide.');
    }
    
    // Sucesso! Recarrega a lista
    await carregarSlides();

  } catch (error) {
    console.error('Erro ao deletar:', error);
    alert(`Erro: ${error.message}`);
  }
};

// 7. Funções Auxiliares do Formulário
const prepararEdicao = (slide) => {
  formTitle.value = 'Editando Slide';
  editingSlideId.value = slide._id;
  
  // Clona os dados do slide para o formulário
  // Precisamos formatar a data para o input datetime-local
  const data = new Date(slide.dataExpiracao);
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  
  form.value = {
    titulo: slide.titulo,
    duracao: slide.duracao,
    dataExpiracao: data.toISOString().slice(0, 16),
    conteudoHTML: slide.conteudoHTML
  };

  // Rola a página para o topo, onde está o formulário
  window.scrollTo(0, 0);
};

const resetarFormulario = () => {
  formTitle.value = 'Criar Novo Slide';
  editingSlideId.value = null;
  
  // Limpa o formulário
  form.value = {
    titulo: '',
    duracao: 10,
    dataExpiracao: '',
    conteudoHTML: ''
  };
};

// 8. Função de Logout
const handleLogout = async () => {
  try {
    await fetch(LOGOUT_URL, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Independentemente do resultado, expulsa o usuário
    router.push('/');
  }
};

// 9. Função para formatar a data na lista
const formatarData = (dataISO) => {
  return new Date(dataISO).toLocaleString('pt-BR');
};

// 10. Função para checar se um slide está expirado
const isExpirado = (dataISO) => {
  return new Date(dataISO) <= new Date();
};

// 11. Hook de Ciclo de Vida
// Chama 'carregarSlides' assim que o componente
// estiver pronto na tela.
onMounted(() => {
  carregarSlides();
});
</script>

<style scoped>
/* Copiamos os estilos do 'admin.css' antigo aqui.
  O 'scoped' garante que eles só se aplicam a este componente.
*/

.admin-header {
    width: 100%;
    background-color: #333;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    position: sticky; /* Fixo no topo */
    top: 0;
    left: 0;
    z-index: 100;
}
.admin-header h1 { margin: 0; font-size: 1.5rem; }

#logout-button {
    background-color: #d93025;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
}
#logout-button:hover { background-color: #b0261e; }

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

.form-section {
    flex: 1;
    min-width: 400px;
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    align-self: flex-start;
}
.list-section {
    flex: 2;
    min-width: 400px;
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
.form-group-inline .form-group { flex: 1; }

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.slide-expirado {
  opacity: 0.5;
  background-color: #f8f9fa;
  border-color: #e9ecef;
}

.slide-expirado h3 {
  color: #6c757d; /* Cinza */
  text-decoration: line-through; /* Riscado */
}

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
button:hover { background-color: #0056b3; }

.button-secondary {
  background-color: #6c757d;
}
.button-secondary:hover { background-color: #5a6268; }

/* Lista de Slides */
.slide-item {
    background: #fff;
    border: 1px solid #eee;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}
.slide-item h3 { margin: 0 0 1rem 0; color: #007bff; }
.slide-info p { margin: 0.25rem 0; color: #555; font-size: 0.9rem; }
.slide-info p strong { color: #333; }
.slide-actions { margin-top: 1rem; display: flex; gap: 0.5rem; }
.slide-actions .edit-btn,
.slide-actions .delete-btn {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
}
.slide-actions .edit-btn { background-color: #ffc107; color: #333; }
.slide-actions .delete-btn { background-color: #d93025; }
</style>
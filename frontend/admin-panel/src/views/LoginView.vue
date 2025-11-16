<template>
  <main class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>Login Administrativo</h2>
      
      <div class="form-group">
        <label for="username">Usuário</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      
      <div 
        v-if="message" 
        id="message-display" 
        :class="messageType"
      >
        {{ message }} </div>

      <button type="submit">Login</button>
      <button 
        type="button" 
        class="button-secondary" 
        @click="handleRegister"
      >
        Registrar
      </button>

    </form>
  </main>
</template>

<script setup>
/* <script setup> é a sintaxe moderna (Composition API) do Vue.
  Todo código aqui é executado quando o componente é criado.
*/
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 1. URLs da API (o backend precisa permitir a porta 5173 no CORS)
const LOGIN_API_URL = 'http://localhost:4000/api/auth/login';
const REGISTER_API_URL = 'http://localhost:4000/api/auth/register';

// 2. Variáveis Reativas
// 'ref()' cria uma variável "reativa". Quando seu valor
// muda, o Vue atualiza o HTML automaticamente.
const username = ref('');
const password = ref('');
const message = ref(''); // Para exibir erros ou sucesso
const messageType = ref('error'); // 'error' (vermelho) ou 'success' (verde)

// 3. Acesso ao Roteador
// 'useRouter()' nos dá acesso ao roteador que configuramos
// para que possamos redirecionar o usuário.
const router = useRouter();

// 4. Função de Login
const handleLogin = async () => {
  if (!username.value || !password.value) {
    message.value = 'Por favor, preencha usuário e senha.';
    messageType.value = 'error';
    return;
  }
  
  message.value = ''; // Limpa mensagens antigas

  try {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      }),
      credentials: 'include' // ESSENCIAL para salvar o cookie de auth
    });

    if (response.ok) {
      // SUCESSO!
      const data = await response.json();
      if (data.role === 1) {
        router.push('/admin');
      } else {
        window.location.href = 'http://localhost:3000/frontend/index.html';
      }
    } else {
      // Falha (senha errada, etc.)
      const errorData = await response.json();
      message.value = errorData.message || 'Erro no login.';
      messageType.value = 'error';
    }

  } catch (error) {
    // Falha de rede (CORS, servidor offline)
    console.error('Erro de rede no login:', error);
    message.value = 'Não foi possível conectar ao servidor.';
    messageType.value = 'error';
  }
};

// 5. Função de Registro
const handleRegister = async () => {
  if (!username.value || !password.value) {
    message.value = 'Para registrar, preencha usuário e senha.';
    messageType.value = 'error';
    return;
  }
  
  message.value = ''; // Limpa mensagens antigas

  try {
    const response = await fetch(REGISTER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.status === 201) {
      // Sucesso no Registro!
      message.value = data.message || 'Usuário registrado! Tente fazer login.';
      messageType.value = 'success';
    } else {
      // Falha no Registro (usuário já existe, etc.)
      message.value = data.message || 'Erro ao registrar.';
      messageType.value = 'error';
    }

  } catch (error) {
    // Falha de rede
    console.error('Erro de rede no registro:', error);
    message.value = 'Não foi possível conectar ao servidor.';
    messageType.value = 'error';
  }
};
</script>

<style scoped>
/*
  <style scoped> significa que este CSS se aplica APENAS
  a este componente (LoginView.vue) e não vaza para outros.
  Copiamos os estilos do antigo 'admin.css'.
*/
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  /* Centraliza na tela (requer que o 'App.vue' dê altura) */
  margin: 10vh auto;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; 
}

button {
  width: 100%;
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
  margin-top: 0.5rem;
  background-color: #6c757d;
}

.button-secondary:hover {
  background-color: #5a6268;
}

#message-display {
  margin-bottom: 1rem; /* Acima dos botões */
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

#message-display.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

#message-display.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
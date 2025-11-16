'use strict';

// URLs da API do Backend
const LOGIN_API_URL = 'http://localhost:4000/api/auth/login';
const REGISTER_API_URL = 'http://localhost:4000/api/auth/register';

// Seleciona os elementos do HTML
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const messageDisplay = document.getElementById('message-display');

// Função para exibir mensagens ao usuário
function showMessage(message, type = 'error') {
    messageDisplay.textContent = message;
    messageDisplay.className = type;
}

// Lógica de LOGIN
loginButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage('Por favor, preencha usuário e senha.');
        return;
    }
    
    showMessage('', 'error');

    try {
        // Envia a requisição POST para login
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.role === 1) {
                console.log('Login do admin bem-sucedido:', data);
                window.location.href = 'admin.html';
            } else {
                console.log('Login do usuário bem-sucedido:', data);
                window.location.href = '../index.html';
            }
        } else {
            const errorData = await response.json();
            showMessage(errorData.message || 'Erro no login.');
        }

    } catch (error) {
        console.error('Erro de rede no login:', error);
        showMessage('Não foi possível conectar ao servidor.');
    }
});

// Lógica de REGISTRO
registerButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage('Para registrar, preencha usuário e senha.');
        return;
    }
    
    showMessage('', 'error');

    try {
        // Envia a requisição POST para registro
        const response = await fetch(REGISTER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.status === 201) {
            console.log('Registro bem-sucedido:', data);
            showMessage(data.message || 'Usuário registrado! Tente fazer login.', 'success');
        } else {
            showMessage(data.message || 'Erro ao registrar.');
        }

    } catch (error) {
        console.error('Erro de rede no registro:', error);
        showMessage('Não foi possível conectar ao servidor.');
    }
});
'use strict';

// 1. URLs da API (baseado em slideRoutes.js e server.js)
const API_URL = 'http://localhost:4000/api/slides/slides'; // Rota para GET, POST
const LOGOUT_URL = 'http://localhost:4000/api/auth/logout';

// 2. Seleciona os elementos principais do HTML
const slideList = document.getElementById('slide-list');
const slideForm = document.getElementById('slide-form');
const formTitle = document.getElementById('form-title');
const slideIdInput = document.getElementById('slide-id');
const tituloInput = document.getElementById('titulo');
const duracaoInput = document.getElementById('duracao');
const dataExpiracaoInput = document.getElementById('dataExpiracao');
const conteudoHTMLInput = document.getElementById('conteudoHTML');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const logoutButton = document.getElementById('logout-button');

// --- FUNÇÃO PRINCIPAL: CARREGAR SLIDES ---

/**
 * Busca todos os slides no backend e os exibe na tela.
 */
async function carregarSlides() {
    try {
        // Envia a requisição GET. 
        // 'credentials: 'include'' é VITAL para enviar o cookie
        // de autenticação que recebemos no login.
        const response = await fetch(API_URL, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            // Se o cookie for inválido (Não Autorizado) ou
            // se o usuário não for admin (Proibido),
            // ele é expulso para a página de login.
            console.log('Não autorizado. Redirecionando para login.');
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Falha ao carregar slides.');
        }

        const slides = await response.json();
        
        // Limpa a lista antiga
        slideList.innerHTML = ''; 

        if (slides.length === 0) {
            slideList.innerHTML = '<p>Nenhum slide cadastrado.</p>';
        } else {
            // Cria o HTML para cada slide
            slides.forEach(slide => {
                const item = document.createElement('div');
                item.className = 'slide-item';
                
                // Formata a data para exibição
                const dataExp = new Date(slide.dataExpiracao).toLocaleString('pt-BR');
                
                item.innerHTML = `
                    <h3>${slide.titulo}</h3>
                    <div class="slide-info">
                        <p><strong>ID:</strong> ${slide._id}</p>
                        <p><strong>Duração:</strong> ${slide.duracao} segundos</p>
                        <p><strong>Expira em:</strong> ${dataExp}</p>
                    </div>
                    <div class="slide-actions">
                        <button class="edit-btn" data-id="${slide._id}">Editar</button>
                        <button class="delete-btn" data-id="${slide._id}">Remover</button>
                    </div>
                `;
                slideList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar slides:', error);
        slideList.innerHTML = '<p>Erro ao carregar slides. Tente recarregar a página.</p>';
    }
}

// --- LÓGICA DO FORMULÁRIO (CRIAR e ATUALIZAR) ---

slideForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    // 1. Pega os dados do formulário
    const slideData = {
        titulo: tituloInput.value,
        duracao: parseInt(duracaoInput.value, 10),
        dataExpiracao: new Date(dataExpiracaoInput.value).toISOString(),
        conteudoHTML: conteudoHTMLInput.value
    };

    // 2. Verifica se estamos editando (se há um ID no campo oculto)
    const slideId = slideIdInput.value;
    
    let url = API_URL;
    let method = 'POST'; // Método padrão é CRIAR

    if (slideId) {
        // Se temos um ID, estamos ATUALIZANDO (PUT)
        url = `${API_URL}/${slideId}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Envia o cookie de admin
            body: JSON.stringify(slideData)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Erro ao ${slideId ? 'atualizar' : 'criar'} slide`);
        }
        
        // 3. Sucesso!
        resetarFormulario();
        await carregarSlides(); // Recarrega a lista

    } catch (error) {
        console.error('Erro ao salvar slide:', error);
        alert(`Erro: ${error.message}`);
    }
});

/**
 * Reseta o formulário para o estado de "Criar Novo".
 */
function resetarFormulario() {
    formTitle.textContent = 'Criar Novo Slide';
    slideForm.reset(); // Limpa todos os campos
    slideIdInput.value = ''; // Limpa o ID oculto
    cancelButton.style.display = 'none'; // Esconde o botão "Cancelar"
}

// Adiciona o evento ao botão "Cancelar"
cancelButton.addEventListener('click', resetarFormulario);


// --- LÓGICA DA LISTA (EDITAR e DELETAR) ---

slideList.addEventListener('click', async (event) => {
    const target = event.target; // O elemento exato que foi clicado

    // Pega o ID do slide guardado no atributo 'data-id'
    const id = target.getAttribute('data-id');

    // 1. Ação: DELETAR
    if (target.classList.contains('delete-btn')) {
        // Pede confirmação
        if (!confirm(`Tem certeza que deseja remover o slide ID: ${id}?`)) {
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
    }

    // 2. Ação: EDITAR
    if (target.classList.contains('edit-btn')) {
        // Encontra o slide correspondente na lista que já carregamos
        const response = await fetch(API_URL, { method: 'GET', credentials: 'include' });
        const slides = await response.json();
        const slideParaEditar = slides.find(slide => slide._id === id);

        if (!slideParaEditar) {
            alert('Slide não encontrado. A lista pode estar desatualizada.');
            return;
        }

        // Preenche o formulário com os dados do slide
        formTitle.textContent = 'Editando Slide';
        slideIdInput.value = slideParaEditar._id;
        tituloInput.value = slideParaEditar.titulo;
        duracaoInput.value = slideParaEditar.duracao;
        // Formata a data para o formato 'datetime-local' (YYYY-MM-DDTHH:MM)
        const data = new Date(slideParaEditar.dataExpiracao);
        data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
        dataExpiracaoInput.value = data.toISOString().slice(0, 16);
        
        conteudoHTMLInput.value = slideParaEditar.conteudoHTML;
        cancelButton.style.display = 'inline-block'; // Mostra o "Cancelar"
        
        // Rola a página para o topo, onde está o formulário
        window.scrollTo(0, 0);
    }
});

// --- LÓGICA DE LOGOUT ---

logoutButton.addEventListener('click', async () => {
    try {
        await fetch(LOGOUT_URL, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        // Independentemente do resultado, expulsa o usuário
        window.location.href = 'login.html';
    }
});

// --- INICIALIZAÇÃO ---
// Carrega os slides assim que a página é aberta
carregarSlides();
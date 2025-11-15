'use strict';

// --- 1. CONFIGURAÇÃO DA CONEXÃO SSE ---

// Rota do servidor backend que fornece os eventos SSE
const SSE_ENDPOINT = 'http://localhost:4000/api/events';

console.log('Iniciando cliente do totem...');
console.log(`Conectando ao servidor em: ${SSE_ENDPOINT}`);

// Instanciamos a API EventSource para conectar à rota SSE
const eventSource = new EventSource(SSE_ENDPOINT);

// --- 2. MANIPULADORES DE EVENTOS SSE ---

eventSource.onopen = () => {
    // Dispara quando conexão for estabelecida
    console.log('[i] Conexão com o servidor estabelecida (SSE). Aguardando slides...');
};

eventSource.onmessage = (event) => {
    /*
      Dispara toda vez que o servidor enviar novas mensagens (slides)

      O 'event.data' contém os dados que o servidor enviou (uma string JSON)
    */
    console.log('[i] Dados brutos (string JSON) recebidos:', event.data);
    
    try {
        // Converte a string JOSN em um array de objetos
        const slidesRecebidos = JSON.parse(event.data);
        
        console.log('[i] Slides processados (Array de Objetos):', slidesRecebidos);

        // Array de slides é passado para a função que gerencia a exibição
        iniciarExibicao(slidesRecebidos);
        
    } catch (error) {
        console.error('Erro ao processar dados (JSON inválido):', error);
    }
};

eventSource.onerror = (error) => {
    // Dispara em caso de erro na conexão SSE
    console.error('[i] Erro na conexão SSE. Verifique se o servidor backend está rodando na porta 4000.', error);
    
    // O próprio EventSource tentará se reconectar automaticamente
};

// --- 3. REFERÊNCIAS DO DOM ---

// Armazena a referência do elemento onde os slides serão exibidos
const display = document.getElementById('totem-display');

// --- 4. VARIÁVEIS DE CONTROLE ---

// Array que armazena os slides válidos (não expirados)
let slidesAtuais = [];

// Índice do slide atual que está sendo exibido
let slideIndice = 0;

// ID do timer (setTimeout) para controle do loop
let timerId = null;

// --- 5. FUNÇÕES PRINCIPAIS ---

// Chamada toda vez que novos slides são recebidos do servidor
function iniciarExibicao(slidesRecebidos) {
    console.log('[i] Iniciando ou atualizando a exibição...');

    // Limpa qualquer loop (setTimeout) anterior.
    if (timerId) {
        clearTimeout(timerId);
        timerId = null;
    }

    // Pega a data e hora atual
    const agora = new Date();

    // Filtra slides expirados
    slidesAtuais = slidesRecebidos.filter(slide => {
        // Converte a 'dataExpiracao' (que vem como string) em um objeto Data
        const dataExpiracao = new Date(slide.dataExpiracao);
        
        // Mantém o slide APENAS se a data de expiração for MAIOR que agora
        return dataExpiracao > agora;
    });

    console.log(`Slides válidos (não expirados): ${slidesAtuais.length} de ${slidesRecebidos.length}`);

    // Reseta o índice e começa o ciclo
    slideIndice = 0;
    
    // Chama a função que exibe o próximo slide
    mostrarProximoSlide();
}

// Exibe o próximo slide no totem
function mostrarProximoSlide() {
    // Verifica se há slides válidos para exibir
    if (slidesAtuais.length === 0) {
        console.log('[i] Não há slides válidos para exibir. Aguardando novos slides...');
        display.innerHTML = '<h1>Aguardando conteúdo...</h1>';
        return;
    }

    // Armazena o slide atual do array
    const slide = slidesAtuais[slideIndice];

    const agora = new Date();
    const dataExpiracao = new Date(slide.dataExpiracao);

    if (dataExpiracao <= agora) {
      console.warn(`[!] O slide "${slide.titulo}" (ID: ${slide._id}) expirou e não deve ser exibido.`);
      // Remove o slide expirado do array
      slidesAtuais.splice(slideIndice, 1);

      // O indice do slide não deve ser incrementado
      // Chama imediatamente o próximo slide
      timerId = setTimeout(mostrarProximoSlide, 0); 
      return;
    }

    // Exibe o conteúdo do slide no <main id="totem-display">
    display.innerHTML = slide.conteudoHTML;

    // Agenda a exibição do próximo slide após a duração especificada
    const duracaoMs = slide.duracao * 1000;

    // Atualiza o índice para o próximo slide
    slideIndice = (slideIndice + 1) % slidesAtuais.length;

    // Chama o próximo slide após o tempo de duração
    timerId = setTimeout(mostrarProximoSlide, duracaoMs);
}
'use strict';

// URL do endpoint SSE do backend
const SSE_ENDPOINT = 'http://localhost:4000/api/events';

console.log('Iniciando cliente do totem...');
console.log(`Conectando ao servidor em: ${SSE_ENDPOINT}`);

const eventSource = new EventSource(SSE_ENDPOINT);

// evento disparado quando a conexão é estabelecida
eventSource.onopen = () => {
    console.log('[i] Conexão com o servidor estabelecida (SSE). Aguardando slides...');
};
// evento disparado quando uma mensagem é recebida
eventSource.onmessage = (event) => {

    console.log('[i] Dados brutos (string JSON) recebidos:', event.data);
    
    try {
        const slidesRecebidos = JSON.parse(event.data);
        
        console.log('[i] Slides processados (Array de Objetos):', slidesRecebidos);
        iniciarExibicao(slidesRecebidos);
        
    } catch (error) {
        console.error('Erro ao processar dados (JSON inválido):', error);
    }
};
// evento disparado em caso de erro na conexão
eventSource.onerror = (error) => {
    console.error('[i] Erro na conexão SSE. Verifique se o servidor backend está rodando na porta 4000.', error);
    
};

const display = document.getElementById('totem-display');

let slidesAtuais = [];

let slideIndice = 0;

let timerId = null;

function iniciarExibicao(slidesRecebidos) {
    console.log('[i] Iniciando ou atualizando a exibição...');

    if (timerId) {
        clearTimeout(timerId);
        timerId = null;
    }

    const agora = new Date();

    // filtra slides expirados
    slidesAtuais = slidesRecebidos.filter(slide => {
        const dataExpiracao = new Date(slide.dataExpiracao);
        
        // mantém apenas slides cuja data de expiração é no futuro
        return dataExpiracao > agora;
    });

    console.log(`Slides válidos (não expirados): ${slidesAtuais.length} de ${slidesRecebidos.length}`);

    // reinicia o índice do slide
    slideIndice = 0;
    
    // função que exibe o próximo slide
    mostrarProximoSlide();
}

// exibe o próximo slide no display
function mostrarProximoSlide() {
    //  verifica se há slides para exibir
    if (slidesAtuais.length === 0) {
        console.log('[i] Não há slides válidos para exibir. Aguardando novos slides...');
        display.innerHTML = '<h1>Aguardando conteúdo...</h1>';
        return;
    }

    // garante que o índice esteja dentro dos limites
    if (slideIndice >= slidesAtuais.length) {
        slideIndice = 0;
    }
    
    // pega o slide atual
    const slide = slidesAtuais[slideIndice];

    const agora = new Date();
    const dataExpiracao = new Date(slide.dataExpiracao);

    if (dataExpiracao <= agora) {
      console.warn(`[!] O slide "${slide.titulo}" (ID: ${slide._id}) expirou e será removido.`);
      // remove o slide expirado do array
      slidesAtuais.splice(slideIndice, 1);

      if (slidesAtuais.length === 0) {
          console.log('[i] Todos os slides expiraram. Aguardando novos slides...');
          display.innerHTML = '<h1>Aguardando conteúdo...</h1>';
          return;
      }
      
      timerId = setTimeout(mostrarProximoSlide, 0); 
      return;
    }

    // exibe o conteúdo HTML do slide no display
    display.innerHTML = slide.conteudoHTML;

    // converte a duração de segundos para milissegundos
    const duracaoMs = slide.duracao * 1000;

    // incrementa o índice para o próximo slide]
    slideIndice = (slideIndice + 1) % slidesAtuais.length;

    // agenda a exibição do próximo slide após a duração especificada
    timerId = setTimeout(mostrarProximoSlide, duracaoMs);
}
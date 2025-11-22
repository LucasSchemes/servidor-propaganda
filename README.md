# 📺 Totem Digital - Servidor de Propaganda

Projeto desenvolvido para a disciplina de **Programação Web** da **Universidade Federal de Santa Catarina (UFSC)**.

O sistema consiste em uma solução completa para gerenciamento e exibição de publicidade em totens digitais (Digital Signage). O foco principal é a atualização de conteúdo em **tempo real** utilizando **Server-Sent Events (SSE)**, garantindo que os totens recebam novos slides instantaneamente, sem necessidade de recarregar a página.

---

## 🚀 Tecnologias Utilizadas

O projeto foi arquitetado em três partes distintas para demonstrar diferentes competências de desenvolvimento web:

### 1. Backend (API REST)
* **Node.js & Express:** Servidor web robusto e escalável.
* **MongoDB & Mongoose:** Banco de dados NoSQL para armazenar slides e usuários.
* **Server-Sent Events (SSE):** Tecnologia para *streaming* unidirecional de dados (push do servidor para o cliente).
* **Autenticação:** JWT (JSON Web Tokens) via Cookies `httpOnly` e criptografia de senhas com `Argon2`.
* **CORS:** Configurado para permitir comunicação entre diferentes portas de desenvolvimento.

### 2. Frontend Administrativo (Gestão)
* **Vue.js 3 (Composition API):** Framework reativo para construção da interface.
* **Vite:** Ferramenta de build moderna e rápida.
* **Vue Router:** Gerenciamento de rotas (SPA - Single Page Application).
* **Componentização:** Arquitetura limpa separando Formulários e Listagens.

### 3. Frontend Totem (Exibição)
* **Vanilla JavaScript (JS Puro):** Implementação leve e otimizada sem frameworks, conforme requisitos de desempenho para dispositivos embarcados.
* **HTML5 & CSS3:** Estrutura e estilização responsiva para tela cheia.
* **DOM Manipulation:** Atualização dinâmica do conteúdo recebido via SSE.

---

## ⚙️ Funcionalidades

### 🛡️ Painel Administrativo
* **Autenticação Segura:** Login e Registro de administradores.
* **CRUD de Slides:** Criar, Listar, Editar e Remover slides.
* **Feedback Visual:** Indicação clara de slides ativos e expirados (riscados/esmaecidos).
* **Validação:** Formulários com validação de campos obrigatórios e datas.

### 🖥️ Totem de Exibição
* **Atualização em Tempo Real:** Novos slides aparecem instantaneamente quando criados no admin.
* **Loop Inteligente:** Exibe slides sequencialmente respeitando a `duração` definida individualmente.
* **Auto-Remoção:** O próprio navegador verifica a `data de expiração` a cada ciclo e remove slides vencidos imediatamente, sem depender do servidor.
* **Estado de Espera:** Exibe mensagem padrão quando não há slides válidos.

### 🔌 Backend
* **Rotina de Limpeza:** Um *Cron Job* interno roda a cada hora para limpar fisicamente os slides expirados do banco de dados.
* **Proteção de Rotas:** Middlewares `protect` e `admin` garantem que apenas usuários autorizados gerenciem o conteúdo.

---

## 📦 Estrutura do Projeto

```bash
/servidor-propaganda
│
├── backend/                 # Servidor Node.js (API + Banco de Dados)
│   ├── controllers/         # Lógica das rotas
│   ├── models/              # Schemas do MongoDB
│   ├── middlewares/         # Autenticação e Segurança
│   └── server.js            # Ponto de entrada
│
└── frontend/
    ├── admin-panel/         # Projeto Vue.js (Painel do Administrador)
    │   ├── src/components/  # Componentes (SlideForm, SlideList, etc.)
    │   └── src/views/       # Páginas (LoginView, AdminView)
    │
    └── totem/               # Cliente JS Puro (Tela do Totem)
        ├── index.html
        ├── totem.js         # Lógica de SSE e Loop
        └── style.css
````

-----

## 🛠️ Instalação e Execução

Para rodar este projeto, você precisará ter instalado:

  * [Node.js](https://nodejs.org/)
  * [MongoDB](https://www.mongodb.com/) (Rodando localmente ou via Atlas)

### Passo 1: Configurar o Backend

1.  Acesse a pasta do servidor:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes configurações (baseado no `.env.example`):
    ```env
    MONGO_URI=mongodb://localhost:27017/servidor-propaganda
    JWT_SECRET=sua-chave-secreta-aqui
    PASSWORD_PEPPER=seu-segredo-extra-aqui
    PORT=4000
    ```
4.  Inicie o servidor:
    ```bash
    npm run dev
    ```
    *O servidor rodará em `http://localhost:4000`.*

### Passo 2: Configurar o Painel Admin (Vue)

1.  Abra um novo terminal e acesse a pasta do admin:
    ```bash
    cd frontend/admin-panel
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do Vite:
    ```bash
    npm run dev
    ```
    *O painel rodará geralmente em `http://localhost:5173`.*

### Passo 3: Rodar o Totem

1.  Vá até a pasta `frontend/totem`.
2.  Abra o arquivo `index.html` no seu navegador.
      * **Recomendado:** Utilize a extensão "Live Server" do VS Code (porta 3000 ou similar) para evitar bloqueios de CORS ou problemas com caminhos de arquivo.
      * Acesse: `http://localhost:3000/frontend/totem/index.html`

-----

## 🧪 Como Testar

1.  **Abra o Totem:** Deixe a janela do Totem aberta em um lado da tela. Ela deve mostrar "Aguardando conteúdo...".
2.  **Abra o Admin:** Acesse o painel administrativo, registre um usuário e faça login.
3.  **Crie um Slide:** Preencha o formulário e salve.
4.  **Observe a Mágica:** O slide aparecerá na lista do Admin e, **instantaneamente**, começará a ser exibido na janela do Totem.
5.  **Teste a Expiração:** Edite um slide para expirar daqui a 1 minuto. Aguarde e veja ele sumir do Totem automaticamente.

-----

## 📝 Autores

Trabalho desenvolvido por:

* **Pedro Magnavita** ([@pedromagnavita](https://github.com/pedromagnavita)) - Frontend (Vue & Totem) e Integração.
* **Lucas Schemes** ([@LucasSchemes](https://github.com/LucasSchemes)) - Backend (API & Banco de Dados).

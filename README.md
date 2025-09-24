# 🌿 Mundo dos Mangues - Educação Interativa

> Plataforma educacional interativa para ensinar sobre ecossistemas de mangues de forma lúdica e envolvente.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Jogos Educativos](#-jogos-educativos)
- [Docker](#-docker)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🌱 Sobre o Projeto

O **Mundo dos Mangues** é uma aplicação web educativa desenvolvida para conscientizar sobre a importância dos ecossistemas de mangues. O projeto combina informação científica com elementos interativos e jogos, tornando o aprendizado sobre biodiversidade e conservação ambiental mais acessível e divertido.

### 🎯 Objetivos

- Educar sobre a biodiversidade dos mangues brasileiros
- Conscientizar sobre ameaças ambientais
- Promover práticas de conservação
- Proporcionar experiência de aprendizado interativa
- Desenvolver consciência ecológica

---

## ⭐ Funcionalidades

### 📖 Conteúdo Educativo
- **Biodiversidade**: Catálogo interativo de espécies do mangue
- **Estrutura do Ecossistema**: Explicação das camadas e componentes
- **Ameaças Ambientais**: Identificação de problemas e soluções
- **Conservação**: Práticas sustentáveis e ações individuais

### 🎮 Jogos Interativos
- **Jogo da Memória**: Memorização de espécies nativas
- **Jogo das Conexões**: Compreensão das relações ecológicas
- **Quiz Interativo**: Teste de conhecimentos *(em desenvolvimento)*

### 📱 Experiência do Usuário
- Design responsivo (mobile-first)
- Interface intuitiva e colorida
- Navegação acessível
- Feedback visual e sonoro
- Animações suaves

---

## 🛠️ Tecnologias

### Frontend
- **React 18.3.1** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização e responsividade
- **Vite** - Build tool e dev server
- **React Router Dom 7.8.2** - Roteamento
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **CORS** - Políticas de origem cruzada
- **Helmet** - Headers de segurança
- **Express Rate Limit** - Limitação de requisições

### DevOps & Ferramentas
- **Docker & Docker Compose** - Containerização
- **Nginx** - Proxy reverso (produção)
- **ESLint** - Linting de código
- **PostCSS & Autoprefixer** - Processamento de CSS

---

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │   Backend       │    │   Data Layer    │
│   (React/Vite)  │◄──►│   (Express)     │◄──►│   (JSON Files)  │
│   Port: 5000    │    │   Port: 3001    │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Padrões Utilizados
- **Component-Based Architecture** (React)
- **Custom Hooks** para lógica de estado
- **Context API** para estado global
- **RESTful API** design
- **Modular Structure** no backend

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- Docker 20.10+ (opcional)
- Docker Compose 2.0+ (opcional)

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Inicie o backend
npm run dev:backend

# 5. Em outro terminal, inicie o frontend
npm run dev
```

### Instalação com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# 2. Configure o ambiente
cp .env.example .env

# 3. Execute com Docker
docker-compose up --build
```

---

## 💻 Uso

### Desenvolvimento
```bash
# Frontend + Backend simultaneamente
docker-compose up --build

# Acessar aplicação
open http://localhost:5000
```

### Produção (com Nginx)
```bash
# Build e deploy completo
docker-compose -f docker-compose.prod.yml up --build

# Acessar aplicação
open http://localhost:8080
```

### Scripts Disponíveis
```bash
npm run dev          # Frontend (Vite dev server)
npm run dev:backend  # Backend (Node.js)
npm run build        # Build de produção
npm run lint         # Verificação de código
npm run preview      # Preview do build
```

---

## 📁 Estrutura do Projeto

```
mundo-dos-mangues/
├── 📁 backend/                    # Servidor Express
│   ├── server.js                  # Configuração principal
│   └── src/
│       ├── data/                  # Dados estáticos (JSON)
│       │   ├── especies.js        # Espécies do mangue
│       │   ├── ameacas.js         # Ameaças ambientais
│       │   └── jogo.js            # Dados dos jogos
│       └── routes/                # Rotas da API
│           ├── especies.js
│           ├── ameacas.js
│           ├── jogo.js
│           └── conexoes.js
├── 📁 src/                        # Frontend React
│   ├── components/                # Componentes reutilizáveis
│   │   └── Navbar.tsx
│   ├── pages/                     # Páginas da aplicação
│   │   ├── HomePage.tsx
│   │   ├── BiodiversidadePage.tsx
│   │   ├── EstruturaPage.tsx
│   │   ├── AmeacasPage.tsx
│   │   ├── JogoDaMemoria.tsx
│   │   ├── JogoConexoes.tsx
│   │   └── ContatoFuncionalPage.tsx
│   ├── context/                   # Contextos globais
│   │   └── GameContext.tsx
│   ├── hooks/                     # Custom hooks
│   │   └── useApi.ts
│   ├── utils/                     # Utilitários
│   │   └── api.ts
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais
├── 📁 docker/                     # Configurações Docker
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔗 API Endpoints

### Espécies
```http
GET /api/especies          # Lista todas as espécies
GET /api/especies/:id      # Detalhes de uma espécie específica
```

### Ameaças Ambientais
```http
GET /api/ameacas           # Lista todas as ameaças
GET /api/ameacas/:id       # Detalhes de uma ameaça específica
```

### Jogos
```http
GET /api/jogo-memoria      # Dados para o jogo da memória
GET /api/conexoes          # Dados para o jogo das conexões
```

### Sistema
```http
GET /api/health            # Health check da API
```

### Exemplos de Resposta

**GET /api/especies**
```json
[
  {
    "id": 1,
    "nome": "Caranguejo-uçá",
    "descricao": "Grande caranguejo que vive nos mangues...",
    "habitat": "Buracos na lama do mangue, entre as raízes das árvores",
    "imagem": "🦀",
    "adaptacoes": [
      "Brânquias modificadas para respirar fora da água",
      "Garras fortes para cavar buracos profundos"
    ]
  }
]
```

---

## 🎮 Jogos Educativos

### Jogo da Memória
- **Objetivo**: Memorizar pares de espécies
- **Níveis**: Fácil (8 cartas), Médio (12 cartas), Difícil (16 cartas)
- **Pontuação**: Sistema baseado em tempo e tentativas
- **Educação**: Familiarização com espécies nativas

### Jogo das Conexões
- **Objetivo**: Conectar espécies com seus "superpoderes" ecológicos
- **Mecânica**: Drag and drop ou clique
- **Feedback**: Explicação das relações ecológicas
- **Educação**: Compreensão da cadeia alimentar

### Quiz Interativo *(Em Desenvolvimento)*
- **Objetivo**: Testar conhecimentos sobre mangues
- **Categorias**: Biodiversidade, Ameaças, Conservação
- **Níveis**: Iniciante, Intermediário, Avançado
- **Certificação**: Certificado digital de conclusão

---

## 🐳 Docker

### Configurações Disponíveis

#### Desenvolvimento (Simples)
```yaml
# docker-compose.yml
- Frontend: http://localhost:5000
- Backend: http://localhost:3001
- Hot Reload: Ativo
- Volumes: Mapeados para desenvolvimento
```

#### Produção (Com Nginx)
```yaml
# docker-compose.prod.yml  
- Aplicação: http://localhost:8080
- Nginx: Proxy reverso
- Build: Otimizado para produção
- Cache: Configurado
- Rate Limiting: Ativo
```

### Comandos Docker

```bash
# Desenvolvimento
docker-compose up --build
docker-compose down

# Produção
docker-compose -f docker-compose.prod.yml up --build
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Rebuild completo
docker-compose down -v --rmi all
docker-compose up --build
```

---

## 🌐 Deploy

### Opções de Deploy

#### 1. Desenvolvimento Local
```bash
docker-compose up -d
ngrok http 5000  # Exposição externa
```

#### 2. Heroku
```bash
# Usar setup sem Nginx
git push heroku main
```

#### 3. AWS / DigitalOcean
```bash
# Usar docker-compose.prod.yml
# Configurar domínio e HTTPS
# Ajustar variáveis de ambiente
```

#### 4. Vercel (Frontend) + Railway (Backend)
```bash
# Frontend: Vercel
# Backend: Railway com PostgreSQL
# Configurar CORS para domínio específico
```

### Variáveis de Ambiente

```bash
# .env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
```

---

## 📈 Roadmap

### ✅ Concluído
- [x] Estrutura básica React + Express
- [x] Páginas informativas
- [x] Jogo da Memória
- [x] Jogo das Conexões
- [x] Containerização Docker
- [x] API RESTful
- [x] Design responsivo

### 🚧 Em Desenvolvimento
- [ ] Quiz Interativo
- [ ] Sistema de pontuação
- [ ] Galeria de fotos reais
- [ ] Modo offline (PWA)

### 📋 Planejado
- [ ] Autenticação de usuários
- [ ] Painel administrativo
- [ ] Relatórios de progresso
- [ ] Integração com redes sociais
- [ ] Versão mobile nativa
- [ ] Suporte a múltiplos idiomas
- [ ] Acessibilidade avançada
- [ ] Analytics e métricas

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. Crie uma **feature branch**: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um **Pull Request**

### Padrões de Código

- **TypeScript** para tipagem
- **ESLint** para linting
- **Conventional Commits** para mensagens
- **Component-driven** development
- **Mobile-first** responsive design

### Testes
```bash
# Executar testes (quando implementados)
npm test

# Coverage
npm run test:coverage

# E2E Tests
npm run test:e2e
```

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 👥 Equipe

- **[Seu Nome]** - Desenvolvedor Full Stack
- **Contribuidores** - [Lista de contribuidores](CONTRIBUTORS.md)

---

## 📞 Contato

- **GitHub**: [@seu-usuario](https://github.com/seu-usuario)
- **Email**: seu-email@exemplo.com
- **LinkedIn**: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- **Website**: [Portfólio](https://seu-site.com)

---

## 🙏 Agradecimentos

- **Comunidade React** - Framework e ecossistema
- **Tailwind CSS** - Framework de estilização
- **Express.js** - Framework backend
- **Docker Community** - Containerização
- **Contribuidores Open Source** - Inspiração e conhecimento

---

## 📊 Estatísticas do Projeto

![GitHub repo size](https://img.shields.io/github/repo-size/seu-usuario/mundo-dos-mangues)
![GitHub language count](https://img.shields.io/github/languages/count/seu-usuario/mundo-dos-mangues)
![GitHub top language](https://img.shields.io/github/languages/top/seu-usuario/mundo-dos-mangues)
![GitHub last commit](https://img.shields.io/github/last-commit/seu-usuario/mundo-dos-mangues)

---

<div align="center">

### 🌿 Proteja os Mangues, Proteja o Futuro! 🌿

*Feito com 💚 para educação ambiental*

</div>
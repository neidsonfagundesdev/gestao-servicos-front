# Gestão de Serviços — Frontend

Interface web desenvolvida em **React** para o sistema de gestão de clientes, serviços e agendamentos.

O frontend consome uma API REST desenvolvida em Laravel e possui autenticação por token, rotas protegidas, controle de interface por perfil de usuário, tratamento de erros e integração com ambiente de desenvolvimento e produção.

Versão atual:

```text
1.0.0
```

---

## Aplicação em produção

https://gestao-servicos-front.onrender.com

## API utilizada

https://gestao-servicos-c7t4.onrender.com

## Repositório do backend

https://github.com/neidsonfagundesdev/gestao-servicos

---

## Tecnologias utilizadas

- React 19
- React DOM
- React Router DOM
- JavaScript
- HTML
- CSS
- Vite 8
- ESLint
- Fetch API
- Render

---

## Funcionalidades

A aplicação possui páginas para:

- login;
- dashboard;
- clientes;
- serviços;
- agendamentos.

Após a autenticação, o usuário navega pelo sistema através de um menu compartilhado entre as páginas protegidas.

---

## Autenticação

O frontend realiza login enviando e-mail e senha para:

```text
POST /api/login
```

Quando as credenciais são válidas, a API retorna:

- token de autenticação;
- dados do usuário.

Essas informações são armazenadas no navegador:

```javascript
localStorage.setItem('token', dados.token);
localStorage.setItem(
  'usuario',
  JSON.stringify(dados.usuario)
);
```

O token é enviado nas requisições protegidas utilizando:

```http
Authorization: Bearer SEU_TOKEN
```

---

## Rotas protegidas

As páginas internas utilizam um componente `ProtectedRoute`.

Se não existir token salvo no navegador, o usuário é redirecionado para:

```text
/login
```

Rotas protegidas:

```text
/dashboard
/clientes
/servicos
/agendamentos
```

A proteção real de autenticação e autorização continua sendo feita pelo backend.

O frontend utiliza a informação local principalmente para controlar navegação e interface.

---

## Login e feedback ao usuário

Durante o login, o botão é temporariamente desabilitado e passa a exibir:

```text
Entrando...
```

Isso evita múltiplos envios enquanto o frontend aguarda a resposta da API.

O sistema também trata situações como:

- credenciais incorretas;
- falha de conexão com o backend;
- token inválido ou expirado;
- excesso de tentativas de login.

Quando a API retorna:

```text
429 Too Many Requests
```

o usuário recebe a mensagem:

```text
Muitas tentativas de login. Aguarde um minuto e tente novamente.
```

---

## Dashboard

O dashboard apresenta informações resumidas do sistema, como:

- total de clientes cadastrados;
- quantidade de serviços ativos;
- total de agendamentos;
- quantidade de agendamentos do dia;
- próximos agendamentos.

Também são exibidos:

- cliente;
- serviço;
- data;
- horário;
- status do agendamento.

---

## Clientes

A página de clientes permite:

- listar clientes;
- cadastrar clientes;
- editar clientes;
- excluir clientes, quando permitido.

Campos utilizados:

```text
nome
telefone
email
observações
```

Antes de uma exclusão, o sistema solicita confirmação.

As regras de autorização continuam sendo validadas pelo backend.

---

## Serviços

Usuários autenticados podem visualizar os serviços cadastrados.

Administradores também podem:

- cadastrar serviços;
- editar serviços;
- excluir serviços.

Os serviços possuem informações como:

```text
nome
descrição
duração em minutos
preço
status ativo/inativo
```

O formulário de gerenciamento de serviços é exibido apenas para usuários com perfil:

```text
admin
```

---

## Agendamentos

A página de agendamentos permite:

- listar agendamentos;
- criar novos agendamentos;
- editar agendamentos;
- excluir agendamentos quando autorizado.

O formulário utiliza:

- cliente;
- serviço;
- data;
- horário;
- status;
- observações.

A lista de serviços apresentada durante o agendamento utiliza somente serviços ativos.

Os status exibidos no sistema são:

```text
Agendado
Confirmado
Em atendimento
Concluído
Cancelado
```

Regras como conflito de horário, permissões e datas inválidas são validadas pela API e as mensagens retornadas são apresentadas ao usuário.

---

## Perfis de usuário

O sistema trabalha com dois perfis:

```text
admin
funcionario
```

O frontend utiliza o perfil salvo após o login para decidir quais ações devem aparecer na interface.

Por exemplo:

- administrador pode visualizar ações administrativas;
- funcionário possui interface mais restrita.

A autorização definitiva continua sendo feita pelo backend Laravel.

---

## Integração com a API

As requisições do sistema estão centralizadas em:

```text
src/services/api.js
```

Esse arquivo possui funções para operações como:

```text
listarAgendamentos()
criarAgendamento()
atualizarAgendamento()
excluirAgendamento()

listarClientes()
criarCliente()
atualizarCliente()
excluirCliente()

listarServicos()
criarServico()
atualizarServico()
excluirServico()

buscarDashboard()
logout()
```

Essa centralização evita espalhar chamadas HTTP por vários arquivos da aplicação.

---

## Tratamento de respostas

O frontend possui tratamento central das respostas recebidas da API.

Exemplos:

### 401 — Não autenticado

O token e os dados do usuário são removidos:

```javascript
localStorage.removeItem('token');
localStorage.removeItem('usuario');
```

O usuário pode então ser redirecionado para o login.

### 403 — Sem permissão

Indica que o usuário está autenticado, mas não possui autorização para executar determinada ação.

### 409 — Conflito

Pode ocorrer, por exemplo, quando uma regra de negócio impede determinada operação.

### 422 — Erro de validação

Utilizado quando os dados enviados não atendem às validações da API.

### 429 — Muitas requisições

Utilizado quando o limite de tentativas de login é atingido.

---

## Ambientes

A URL da API é definida através da variável:

```env
VITE_API_URL
```

O código utiliza:

```javascript
export const API_URL = import.meta.env.VITE_API_URL;
```

### Desenvolvimento

Arquivo:

```text
.env.development
```

Configuração:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Produção

Arquivo:

```text
.env.production
```

Configuração:

```env
VITE_API_URL=https://gestao-servicos-c7t4.onrender.com/api
```

Isso permite utilizar o mesmo código em ambientes diferentes sem deixar URLs fixas espalhadas pela aplicação.

---

## Executando o projeto localmente

### Pré-requisitos

Tenha instalado:

- Node.js
- npm
- Git

Clone o repositório:

```bash
git clone https://github.com/neidsonfagundesdev/gestao-servicos-front.git
```

Entre na pasta:

```bash
cd gestao-servicos-front
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação.

---

## Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento do Vite.

### Verificação de código

```bash
npm run lint
```

Executa o ESLint para identificar problemas no código JavaScript e React.

### Build de produção

```bash
npm run build
```

Gera os arquivos otimizados para produção na pasta:

```text
dist/
```

### Visualizar o build localmente

```bash
npm run preview
```

---

## Build

O projeto foi validado utilizando:

```bash
npm run lint
```

e:

```bash
npm run build
```

O build de produção utiliza Vite e gera os arquivos estáticos dentro de:

```text
dist/
```

---

## Deploy

O frontend está hospedado no Render como aplicação estática.

Configuração principal:

```text
Build Command:
npm install && npm run build
```

Diretório publicado:

```text
dist
```

Como o projeto utiliza React Router, o servidor precisa direcionar as rotas da aplicação para:

```text
/index.html
```

Isso permite acessar diretamente rotas como:

```text
/dashboard
/clientes
/servicos
/agendamentos
```

sem receber erro ao atualizar a página.

---

## Estrutura principal

```text
src/
├── components/
│   ├── Layout.jsx
│   ├── Menu.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Clientes.jsx
│   ├── Servicos.jsx
│   └── Agendamentos.jsx
│
├── services/
│   └── api.js
│
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

---

## Navegação

O projeto utiliza React Router.

Estrutura principal:

```text
/login
    ↓
autenticação
    ↓
ProtectedRoute
    ↓
Layout
    ↓
Dashboard / Clientes / Serviços / Agendamentos
```

O componente `Layout` mantém o menu disponível enquanto o conteúdo da página atual é renderizado através do `Outlet` do React Router.

---

## Logout

Ao sair do sistema:

1. o frontend chama o endpoint de logout;
2. o backend revoga o token;
3. o token é removido do navegador;
4. os dados do usuário são removidos;
5. o usuário retorna para `/login`.

Mesmo que ocorra uma falha de comunicação com o backend durante o logout, os dados locais são removidos para encerrar a sessão no frontend.

---

## Principais conceitos praticados

Este projeto foi desenvolvido também com o objetivo de aplicar conceitos importantes de desenvolvimento frontend, como:

- componentização;
- estado com `useState`;
- efeitos com `useEffect`;
- navegação com React Router;
- rotas protegidas;
- consumo de API REST;
- requisições assíncronas;
- Fetch API;
- autenticação com Bearer Token;
- armazenamento no `localStorage`;
- tratamento de erros HTTP;
- renderização condicional;
- controle de interface por perfil;
- formulários;
- CRUD;
- variáveis de ambiente;
- build de produção;
- deploy de aplicação React.

---

## Backend

A API utilizada por este frontend foi desenvolvida em Laravel.

Repositório:

https://github.com/neidsonfagundesdev/gestao-servicos

API:

https://gestao-servicos-c7t4.onrender.com

---

## Autor

**Neidson Fagundes**

GitHub:

https://github.com/neidsonfagundesdev
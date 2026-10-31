// Endereço base da nossa API Laravel.
// Assim evitamos repetir "http://127.0.0.1:8000/api" em toda função.
const API_URL = 'http://127.0.0.1:8000/api';

/*
Função central para tratar respostas da API.

Ela é usada por várias funções abaixo.

Exemplo:
GET /clientes
GET /agendamentos
POST /login
PATCH /clientes/{id}

A ideia é:
- se vier 401, o token não é mais válido;
- se vier outro erro, lançamos uma exceção;
- se der certo, transformamos a resposta em JSON.
*/
async function tratarResposta(response) {
  // 401 = usuário não autenticado
  if (response.status === 401) {
    // Remove o token inválido do navegador
    localStorage.removeItem('token');

    // Interrompe o código e envia esse erro para o catch
    throw new Error('Não autenticado.');
  }

  /*
  response.ok é true para respostas de sucesso,
  normalmente códigos entre 200 e 299.

  Se não for sucesso, lançamos um erro.
  */
  if (!response.ok) {
    throw new Error('Erro na requisição.');
  }

  /*
  Converte o JSON recebido da API
  para um objeto JavaScript.
  */
  return response.json();
}

/*
Lista todos os agendamentos.

Faz:
GET /api/agendamentos
*/
export async function listarAgendamentos() {
  // Pega o token salvo quando o usuário fez login
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'GET',

    headers: {
      // Diz para o Laravel que esperamos JSON
      'Accept': 'application/json',

      // Envia o token de autenticação
      'Authorization': `Bearer ${token}`,
    },
  });

  // Usa nossa função central de tratamento
  return tratarResposta(response);
}

/*
Faz logout do usuário.

Faz:
POST /api/logout

O Laravel revoga o token atual.
*/
export async function logout() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',

    headers: {
      'Accept': 'application/json',

      // Token necessário porque logout é uma rota protegida
      'Authorization': `Bearer ${token}`,
    },
  });

  return tratarResposta(response);
}

/*
Lista todos os clientes.

Faz:
GET /api/clientes
*/
export async function listarClientes() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/clientes`, {
    method: 'GET',

    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return tratarResposta(response);
}

/*
Cria um novo cliente.

Recebe um objeto como:

{
  nome: "João",
  telefone: "71999999999",
  email: "joao@email.com",
  observacoes: "Cliente..."
}

Faz:
POST /api/clientes
*/
export async function criarCliente(cliente) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',

    headers: {
      /*
      Content-Type informa que estamos enviando
      dados em formato JSON.
      */
      'Content-Type': 'application/json',

      'Accept': 'application/json',

      'Authorization': `Bearer ${token}`,
    },

    /*
    JSON.stringify transforma o objeto JavaScript
    em uma string JSON para ser enviada ao Laravel.
    */
    body: JSON.stringify(cliente),
  });

  return tratarResposta(response);
}

/*
Atualiza um cliente existente.

Recebe:
- id do cliente
- objeto com os novos dados

Exemplo:

atualizarCliente(3, {
  nome: "João Atualizado",
  telefone: "71988887777"
});

Faz:
PATCH /api/clientes/3
*/
export async function atualizarCliente(id, cliente) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PATCH',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },

    // Envia os novos dados para o Laravel
    body: JSON.stringify(cliente),
  });

  return tratarResposta(response);
}

/*
Exclui um cliente.

Recebe somente o ID.

Exemplo:

excluirCliente(3);

Faz:
DELETE /api/clientes/3

IMPORTANTE:
No nosso backend, somente admin pode excluir cliente.
Funcionário recebe 403.
*/
export async function excluirCliente(id) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',

    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  /*
  Quando o DELETE dá certo, nosso Laravel retorna:

  204 No Content

  "No Content" significa literalmente:
  não existe conteúdo no corpo da resposta.

  Por isso NÃO podemos fazer response.json()
  nesse caso.
  */
  if (response.status === 204) {
    return;
  }

  /*
  401 = token inválido, expirado ou revogado.
  */
  if (response.status === 401) {
    localStorage.removeItem('token');

    throw new Error('Não autenticado.');
  }

  /*
  403 = usuário está autenticado,
  mas não possui permissão.

  No nosso sistema:
  funcionario tentando excluir cliente → 403
  */
  if (response.status === 403) {
    throw new Error('Sem permissão.');
  }

  // Qualquer outro erro
  if (!response.ok) {
    throw new Error('Erro ao excluir cliente.');
  }
}

/*
Lista todos os serviços cadastrados.

Faz:
GET /api/servicos
*/
export async function listarServicos() {
  // Pega o token salvo no login
  const token = localStorage.getItem('token');

  // Faz a requisição para o Laravel
  const response = await fetch(`${API_URL}/servicos`, {
    method: 'GET',

    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  // Usa a função central que já criamos
  return tratarResposta(response);
}

/*
Cria um novo serviço.

Faz:
POST /api/servicos
*/
export async function criarServico(servico) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/servicos`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },

    body: JSON.stringify(servico),
  });

  return tratarResposta(response);
}

/*
Atualiza um serviço existente.

Exemplo:
PATCH /api/servicos/3
*/
export async function atualizarServico(id, servico) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'PATCH',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },

    // Transforma o objeto JavaScript em JSON
    body: JSON.stringify(servico),
  });

  return tratarResposta(response);
}

/*
Exclui um serviço.

Recebe somente o ID do serviço.

Exemplo:

excluirServico(3);

Faz:
DELETE /api/servicos/3

No nosso backend, somente admin pode excluir.
*/
export async function excluirServico(id) {
  // Pega o token salvo no login
  const token = localStorage.getItem('token');

  // Faz a requisição DELETE para o Laravel
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'DELETE',

    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  /*
  DELETE com sucesso retorna 204 No Content.

  Como não existe JSON na resposta,
  não usamos tratarResposta() nesse caso.
  */
  if (response.status === 204) {
    return;
  }

  // Token inválido ou revogado
  if (response.status === 401) {
    localStorage.removeItem('token');

    throw new Error('Não autenticado.');
  }

  // Usuário autenticado, mas sem permissão
  if (response.status === 403) {
    throw new Error('Sem permissão.');
  }

  // Qualquer outro erro
  if (!response.ok) {
    throw new Error('Erro ao excluir serviço.');
  }
}
const API_URL = 'http://127.0.0.1:8000/api';

async function tratarResposta(response) {
  if (response.status === 401) {
    localStorage.removeItem('token');

    throw new Error('Não autenticado.');
  }

  if (!response.ok) {
    throw new Error('Erro na requisição.');
  }

  return response.json();
}

export async function listarAgendamentos() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return tratarResposta(response);
}

export async function logout() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return tratarResposta(response);
}
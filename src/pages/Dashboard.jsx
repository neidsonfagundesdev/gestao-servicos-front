import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarDashboard } from '../services/api';

function Dashboard() {
  /*
  Guarda todos os dados recebidos do endpoint:

  GET /api/dashboard

  Começa como null porque, antes da API responder,
  ainda não temos os dados.
  */
  const [dados, setDados] = useState(null);

  /*
  Guarda mensagens como:
  - Carregando...
  - erro ao buscar dashboard
  */
  const [mensagem, setMensagem] = useState('Carregando...');

  // Permite navegar para outra rota
  const navigate = useNavigate();

  /*
  Executa quando a página Dashboard é aberta.

  Busca os dados resumidos no Laravel.
  */
  useEffect(() => {
    async function carregarDashboard() {
      try {
        // Faz GET /api/dashboard
        const resposta = await buscarDashboard();

        // Guarda a resposta recebida da API
        setDados(resposta);

        // Limpa a mensagem "Carregando..."
        setMensagem('');
      } catch (error) {
        // Se o token estiver inválido ou revogado
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        // Qualquer outro erro
        setMensagem('Não foi possível carregar o dashboard.');
      }
    }

    carregarDashboard();
  }, [navigate]);

  /*
  Enquanto a API ainda não respondeu,
  mostramos somente a mensagem de carregamento.
  */
  if (!dados) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>{mensagem}</p>
      </div>
    );
  }

  /*
Formata a data para o padrão brasileiro.

Recebe:
2026-11-02

Retorna:
02/11/2026
*/
function formatarData(data) {
  if (!data) {
    return '-';
  }

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}


/*
Transforma o status técnico
em um texto mais amigável.
*/
function formatarStatus(status) {
  const statusFormatados = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_atendimento: 'Em atendimento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  return statusFormatados[status] || status;
}

  return (
    <div>
      <h1>Dashboard</h1>

      {/*
      Área dos cards de resumo.

      Cada card mostra uma informação importante
      do sistema.
      */}
      <section className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Clientes</h3>

          <p className="dashboard-numero">
            {dados.total_clientes}
          </p>

          <span>Cadastrados</span>
        </div>

        <div className="dashboard-card">
          <h3>Serviços</h3>

          <p className="dashboard-numero">
            {dados.servicos_ativos}
          </p>

          <span>Ativos</span>
        </div>

        <div className="dashboard-card">
          <h3>Agendamentos</h3>

          <p className="dashboard-numero">
            {dados.total_agendamentos}
          </p>

          <span>Total</span>
        </div>

        <div className="dashboard-card">
          <h3>Hoje</h3>

          <p className="dashboard-numero">
            {dados.agendamentos_hoje}
          </p>

          <span>Agendamentos</span>
        </div>

      </section>

      {/*
      Área separada para mostrar
      os próximos agendamentos.
      */}
      <section className="dashboard-proximos">

        <h2>Próximos agendamentos</h2>

        {/*
        Se não existir nenhum agendamento futuro,
        mostramos uma mensagem.
        */}
        {dados.proximos_agendamentos.length === 0 ? (
          <p>Nenhum agendamento futuro encontrado.</p>
        ) : (

          /*
          Se existirem agendamentos,
          percorremos o array.

          É parecido com foreach no PHP.
          */
          dados.proximos_agendamentos.map((agendamento) => (
            <div
              className="dashboard-agendamento"
              key={agendamento.id}
            >
              <div>
                <strong>
                  {agendamento.cliente?.nome}
                </strong>

                <p>
                  {agendamento.servico?.nome}
                </p>
              </div>

              <div>
                <p>
                  Data: {formatarData(agendamento.data)}
                </p>

                <p>
                  Hora: {agendamento.hora.slice(0, 5)}
                </p>
              </div>

              <div>
                <p>
                  Status:{' '}

                  <span
                    className={`status status-${agendamento.status}`}
                  >
                    {formatarStatus(agendamento.status)}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}

      </section>
    </div>
  );
}

export default Dashboard;
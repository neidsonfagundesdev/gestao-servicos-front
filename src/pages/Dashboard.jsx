import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarDashboard } from '../services/api';

function Dashboard() {
  /*
  Guarda os dados recebidos do backend.

  Começa como null porque antes da API responder
  ainda não temos nada para mostrar.
  */
  const [dados, setDados] = useState(null);

  // Guarda mensagens de carregamento ou erro
  const [mensagem, setMensagem] = useState('Carregando...');

  // Permite navegar para outra rota
  const navigate = useNavigate();

  /*
  Executa quando o Dashboard abre.
  */
  useEffect(() => {
    async function carregarDashboard() {
      try {
        // Faz GET /api/dashboard
        const resposta = await buscarDashboard();

        // Guarda os dados recebidos
        setDados(resposta);

        // Remove "Carregando..."
        setMensagem('');
      } catch (error) {
        // Token inválido ou revogado
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        setMensagem('Não foi possível carregar o dashboard.');
      }
    }

    carregarDashboard();
  }, [navigate]);

  /*
  Enquanto os dados ainda não chegaram,
  mostramos a mensagem.
  */
  if (!dados) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>{mensagem}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Resumo geral */}
      <div>
        <h2>Resumo</h2>

        <p>
          Clientes cadastrados: {dados.total_clientes}
        </p>

        <p>
          Serviços ativos: {dados.servicos_ativos}
        </p>

        <p>
          Total de agendamentos: {dados.total_agendamentos}
        </p>

        <p>
          Agendamentos de hoje: {dados.agendamentos_hoje}
        </p>
      </div>

      <hr />

      {/* Próximos atendimentos */}
      <div>
        <h2>Próximos agendamentos</h2>

        {dados.proximos_agendamentos.length === 0 ? (
          <p>Nenhum agendamento futuro encontrado.</p>
        ) : (
          dados.proximos_agendamentos.map((agendamento) => (
            <div key={agendamento.id}>
              <p>
                Cliente: {agendamento.cliente?.nome}
              </p>

              <p>
                Serviço: {agendamento.servico?.nome}
              </p>

              <p>
                Funcionário: {agendamento.funcionario?.name}
              </p>

              <p>
                Data: {agendamento.data}
              </p>

              <p>
                Hora: {agendamento.hora}
              </p>

              <p>
                Status: {agendamento.status}
              </p>

              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
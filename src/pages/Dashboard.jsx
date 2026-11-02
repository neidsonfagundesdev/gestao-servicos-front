import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarAgendamentos } from '../services/api';

function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [mensagem, setMensagem] = useState('Carregando...');

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarAgendamentos() {
      try {
        const dados = await listarAgendamentos();

        setAgendamentos(dados.agendamentos);
        setMensagem('');
      } catch (error) {
        if (error.message === 'Não autenticado.') {
            navigate('/login');
            return;
        }

        setMensagem('Não foi possível carregar os agendamentos.');
    }
}
    carregarAgendamentos();
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      {mensagem && <p>{mensagem}</p>}

      <p>Total de agendamentos: {agendamentos.length}</p>

      {agendamentos.map((agendamento) => (
        <div key={agendamento.id}>
          <p>Cliente: {agendamento.cliente?.nome}</p>
          <p>Serviço: {agendamento.servico?.nome}</p>
          <p>Data: {agendamento.data}</p>
          <p>Hora: {agendamento.hora}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
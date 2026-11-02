import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  listarAgendamentos,
  listarClientes,
  listarServicos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento
} from '../services/api';

function Agendamentos() {
  // Guarda a lista de agendamentos recebida da API
  const [agendamentos, setAgendamentos] = useState([]);

  // Guarda os clientes para preencher o select
  const [clientes, setClientes] = useState([]);

  // Guarda os serviços para preencher o select
  const [servicos, setServicos] = useState([]);

  // Guarda mensagens de carregamento, sucesso ou erro
  const [mensagem, setMensagem] = useState('Carregando...');

  // Guarda o cliente escolhido
  const [clienteId, setClienteId] = useState('');

  // Guarda o serviço escolhido
  const [servicoId, setServicoId] = useState('');

  // Guarda a data
  const [data, setData] = useState('');

  // Guarda a hora
  const [hora, setHora] = useState('');

  // Guarda o status do agendamento
  const [status, setStatus] = useState('agendado');

  // Guarda as observações
  const [observacoes, setObservacoes] = useState('');

  /*
  Guarda o ID do agendamento que está sendo editado.

  null = estamos cadastrando
  4    = estamos editando o agendamento de ID 4
  */
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);

  /*
  Recupera o usuário salvo no login.

  Usamos isso para saber se ele é admin
  ou funcionario.
  */
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
    );

  // Permite navegar para outras rotas
  const navigate = useNavigate();

  /*
  Executa quando a página abre.

  Busca:
  - agendamentos
  - clientes
  - serviços
  */
  useEffect(() => {
    async function carregarDados() {
      try {
        const [
          dadosAgendamentos,
          dadosClientes,
          dadosServicos
        ] = await Promise.all([
          listarAgendamentos(),
          listarClientes(),
          listarServicos()
        ]);

        setAgendamentos(dadosAgendamentos.agendamentos);

        setClientes(dadosClientes.clientes);

        setServicos(dadosServicos.servicos);

        setMensagem('');
      } catch (error) {
        // Token inválido ou revogado
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        setMensagem('Não foi possível carregar os dados.');
      }
    }

    carregarDados();
  }, [navigate]);

  /*
  Executa quando o formulário é enviado.

  Essa função serve tanto para:

  POST  -> criar agendamento
  PATCH -> atualizar agendamento
  */
  async function handleSubmit(event) {
    // Impede a página de recarregar
    event.preventDefault();

    try {
      /*
      Monta o objeto que será enviado para o Laravel.

      Não enviamos user_id.
      O backend não permite alterar esse campo.
      */
      const dadosAgendamento = {
        cliente_id: Number(clienteId),
        servico_id: Number(servicoId),
        data,
        hora,
        status,
        observacoes,
      };

      /*
      Se agendamentoEditando tiver um ID,
      estamos atualizando.
      */
      if (agendamentoEditando) {
        await atualizarAgendamento(
          agendamentoEditando,
          dadosAgendamento
        );

        setMensagem('Agendamento atualizado com sucesso.');
      } else {
        /*
        Se for null,
        estamos criando um novo agendamento.
        */
        await criarAgendamento(dadosAgendamento);

        setMensagem('Agendamento criado com sucesso.');
      }

      // Limpa os campos
      setClienteId('');
      setServicoId('');
      setData('');
      setHora('');
      setStatus('agendado');
      setObservacoes('');

      // Sai do modo de edição
      setAgendamentoEditando(null);

      /*
      Busca novamente os agendamentos
      para atualizar a lista.
      */
      const dados = await listarAgendamentos();

      setAgendamentos(dados.agendamentos);

    } catch (error) {
      // Token inválido
      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      /*
      Mostra a mensagem real recebida da API.

      Ex:
      conflito de horário
      serviço inativo
      data inválida
      */
      setMensagem(error.message);
    }
  }

  /*
  Executa quando clicamos em Editar.

  Pega os dados do agendamento e
  coloca dentro do formulário.
  */
  function editarAgendamento(agendamento) {
    // Guarda o ID que está sendo editado
    setAgendamentoEditando(agendamento.id);

    // Preenche o formulário
    setClienteId(String(agendamento.cliente_id));
    setServicoId(String(agendamento.servico_id));
    setData(agendamento.data);

    /*
    A API pode devolver:
    15:30:00

    O input type="time" normalmente trabalha bem com:
    15:30

    slice(0, 5) pega somente HH:MM.
    */
    setHora(agendamento.hora.slice(0, 5));

    setStatus(agendamento.status);

    setObservacoes(agendamento.observacoes || '');
  }

  /*
  Cancela a edição atual.

  Limpa os campos e volta
  para o modo de cadastro.
  */
  function cancelarEdicao() {
    setAgendamentoEditando(null);

    setClienteId('');
    setServicoId('');
    setData('');
    setHora('');
    setStatus('agendado');
    setObservacoes('');

    setMensagem('');
  }

  /*
  Exclui um agendamento.

  Primeiro pede confirmação.
  Depois chama a API.
  */
  async function deletarAgendamento(id) {
    const confirmou = window.confirm(
        'Tem certeza que deseja excluir este agendamento?'
    );

  // Se clicar em Cancelar, para aqui
  if (!confirmou) {
    return;
  }

  try {
    // DELETE /api/agendamentos/{id}
    await excluirAgendamento(id);

    // Busca novamente os agendamentos
    const dados = await listarAgendamentos();

    // Atualiza a lista na tela
    setAgendamentos(dados.agendamentos);

    setMensagem('Agendamento excluído com sucesso.');

  } catch (error) {
    // Token inválido
    if (error.message === 'Não autenticado.') {
    navigate('/login');
    return;
    }

    // Funcionário tentou excluir
    if (error.message === 'Sem permissão.') {
    setMensagem(
        'Você não possui permissão para excluir agendamentos.'
    );
    return;
    }

    setMensagem('Não foi possível excluir o agendamento.');
    }
  }

  return (
    <div>
      <h1>Agendamentos</h1>

      <h2>
        {agendamentoEditando
          ? 'Editar agendamento'
          : 'Novo agendamento'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Cliente</label>

          <select
            value={clienteId}
            onChange={(event) =>
              setClienteId(event.target.value)
            }
          >
            <option value="">
              Selecione um cliente
            </option>

            {clientes.map((cliente) => (
              <option
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Serviço</label>

          <select
            value={servicoId}
            onChange={(event) =>
              setServicoId(event.target.value)
            }
          >
            <option value="">
              Selecione um serviço
            </option>

            {/*
            Mostramos somente serviços ativos.
            */}
            {servicos
              .filter((servico) => servico.ativo)
              .map((servico) => (
                <option
                  key={servico.id}
                  value={servico.id}
                >
                  {servico.nome}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Data</label>

          <input
            type="date"
            value={data}
            onChange={(event) =>
              setData(event.target.value)
            }
          />
        </div>

        <div>
          <label>Hora</label>

          <input
            type="time"
            value={hora}
            onChange={(event) =>
              setHora(event.target.value)
            }
          />
        </div>

        <div>
          <label>Status</label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="agendado">
              Agendado
            </option>

            <option value="confirmado">
              Confirmado
            </option>

            <option value="em_atendimento">
              Em atendimento
            </option>

            <option value="concluido">
              Concluído
            </option>

            <option value="cancelado">
              Cancelado
            </option>
          </select>
        </div>

        <div>
          <label>Observações</label>

          <textarea
            value={observacoes}
            onChange={(event) =>
              setObservacoes(event.target.value)
            }
          />
        </div>

        <button type="submit">
          {agendamentoEditando
            ? 'Salvar alteração'
            : 'Criar agendamento'}
        </button>

        {/*
        Esse botão só aparece
        quando estamos editando.
        */}
        {agendamentoEditando && (
          <button
            type="button"
            onClick={cancelarEdicao}
          >
            Cancelar edição
          </button>
        )}
      </form>

      {/* Mostra mensagens de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <h2>Agendamentos cadastrados</h2>

      {agendamentos.map((agendamento) => (
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

          <p>
            Observações: {
              agendamento.observacoes || 'Nenhuma'
            }
          </p>

          {/*
          Ao clicar, os dados desse agendamento
          vão para o formulário.
          */}
          <button
            onClick={() =>
              editarAgendamento(agendamento)
            }
          >
            Editar
          </button>

          {/* Somente admin vê o botão Excluir */}
          {usuario?.perfil === 'admin' && (
          <button
            onClick={() =>
            deletarAgendamento(agendamento.id)
            }
          >
            Excluir
          </button>
        )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Agendamentos;
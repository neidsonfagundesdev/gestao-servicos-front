import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  listarAgendamentos,
  listarClientes,
  listarServicos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
} from '../services/api';

function Agendamentos() {
  /*
  Guarda os agendamentos recebidos da API.
  */
  const [agendamentos, setAgendamentos] = useState([]);

  /*
  Guarda os clientes.

  Eles serão usados no select.
  */
  const [clientes, setClientes] = useState([]);

  /*
  Guarda os serviços.

  Eles serão usados no select.
  */
  const [servicos, setServicos] = useState([]);

  /*
  Guarda o texto da mensagem.
  */
  const [mensagem, setMensagem] = useState('');

  /*
  Guarda o tipo da mensagem.

  Pode ser:
  "sucesso"
  "erro"
  */
  const [tipoMensagem, setTipoMensagem] = useState('');

  /*
  Campos do formulário.
  */
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  /*
  Status inicial de um novo agendamento.
  */
  const [status, setStatus] = useState('agendado');

  const [observacoes, setObservacoes] = useState('');

  /*
  Guarda qual agendamento está sendo editado.

  null = novo agendamento
  objeto = edição
  */
  const [
    agendamentoEditando,
    setAgendamentoEditando,
  ] = useState(null);

  /*
  Recupera o usuário logado.
  */
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  /*
  Permite navegar para outra rota.
  */
  const navigate = useNavigate();

  /*
  Busca novamente os agendamentos.

  Usamos depois de:
  - criar
  - editar
  - excluir
  */
  async function carregarAgendamentos() {
    try {
      const dados = await listarAgendamentos();

      setAgendamentos(
        dados.agendamentos
      );

    } catch (error) {

      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      setMensagem(
        'Não foi possível carregar os agendamentos.'
      );

      setTipoMensagem('erro');
    }
  }

  /*
  Executa quando a página é aberta.

  Buscamos:
  - agendamentos
  - clientes
  - serviços
  */
  useEffect(() => {
    async function buscarDados() {
      try {
        /*
        Promise.all permite executar
        as três requisições ao mesmo tempo.
        */
        const [
          dadosAgendamentos,
          dadosClientes,
          dadosServicos,
        ] = await Promise.all([
          listarAgendamentos(),
          listarClientes(),
          listarServicos(),
        ]);

        setAgendamentos(
          dadosAgendamentos.agendamentos
        );

        setClientes(
          dadosClientes.clientes
        );

        setServicos(
          dadosServicos.servicos
        );

      } catch (error) {

        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        setMensagem(
          'Não foi possível carregar os dados.'
        );

        setTipoMensagem('erro');
      }
    }

    buscarDados();

  }, [navigate]);

  /*
  Limpa o formulário.
  */
  function limparFormulario() {
    setClienteId('');
    setServicoId('');
    setData('');
    setHora('');
    setStatus('agendado');
    setObservacoes('');

    setAgendamentoEditando(null);
  }

  /*
  Executado quando o formulário é enviado.
  */
  async function handleSubmit(event) {
    event.preventDefault();

    /*
    Limpa mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');

    /*
    Objeto enviado ao Laravel.

    Não enviamos user_id.

    O backend usa o usuário autenticado.
    */
    const agendamento = {
      cliente_id: Number(clienteId),
      servico_id: Number(servicoId),
      data,
      hora,
      status,
      observacoes,
    };

    try {
      /*
      Se existe um agendamento sendo editado,
      fazemos PATCH.
      */
      if (agendamentoEditando) {

        await atualizarAgendamento(
          agendamentoEditando.id,
          agendamento
        );

        setMensagem(
          'Agendamento atualizado com sucesso.'
        );

        setTipoMensagem('sucesso');

      } else {

        /*
        Caso contrário,
        criamos um novo.
        */
        await criarAgendamento(
          agendamento
        );

        setMensagem(
          'Agendamento criado com sucesso.'
        );

        setTipoMensagem('sucesso');
      }

      /*
      Limpa o formulário.
      */
      limparFormulario();

      /*
      Atualiza a lista.
      */
      await carregarAgendamentos();

    } catch (error) {

      /*
      Aqui também aparecem mensagens
      de regra de negócio do backend.

      Ex:
      conflito de horário.
      */
      setMensagem(error.message);

      setTipoMensagem('erro');
    }
  }

  /*
  Coloca um agendamento
  no formulário para edição.
  */
  function editarAgendamento(agendamento) {

    setAgendamentoEditando(
      agendamento
    );

    setClienteId(
      String(agendamento.cliente_id)
    );

    setServicoId(
      String(agendamento.servico_id)
    );

    setData(
      agendamento.data
    );

    /*
    O backend pode retornar:

    14:30:00

    O input type="time" usa:

    14:30
    */
    setHora(
      agendamento.hora.slice(0, 5)
    );

    setStatus(
      agendamento.status
    );

    setObservacoes(
      agendamento.observacoes ?? ''
    );

    /*
    Limpa mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');
  }

  /*
  Cancela a edição.
  */
  function cancelarEdicao() {
    limparFormulario();

    setMensagem('');
    setTipoMensagem('');
  }

  /*
  Exclui um agendamento.
  */
  async function removerAgendamento(id) {

    const confirmar = window.confirm(
      'Deseja realmente excluir este agendamento?'
    );

    if (!confirmar) {
      return;
    }

    setMensagem('');
    setTipoMensagem('');

    try {
      await excluirAgendamento(id);

      setMensagem(
        'Agendamento excluído com sucesso.'
      );

      setTipoMensagem('sucesso');

      await carregarAgendamentos();

    } catch (error) {

      setMensagem(error.message);

      setTipoMensagem('erro');
    }
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

Ex:

em_atendimento
vira
Em atendimento
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
    <div className="pagina">

      {/* ============================= */}
      {/* CABEÇALHO */}
      {/* ============================= */}

      <div className="pagina-cabecalho">

        <div>
          <h1>Agendamentos</h1>

          <p>
            Cadastre e gerencie os atendimentos.
          </p>
        </div>

      </div>


      {/* ============================= */}
      {/* FORMULÁRIO */}
      {/* ============================= */}

      <section className="formulario-card">

        <h2>
          {agendamentoEditando
            ? 'Editar agendamento'
            : 'Novo agendamento'}
        </h2>

        <form
          className="formulario"
          onSubmit={handleSubmit}
        >

          {/* Cliente */}
          <div className="campo">

            <label htmlFor="cliente">
              Cliente
            </label>

            <select
              id="cliente"
              value={clienteId}
              onChange={(event) =>
                setClienteId(event.target.value)
              }
              required
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


          {/* Serviço */}
          <div className="campo">

            <label htmlFor="servico">
              Serviço
            </label>

            <select
              id="servico"
              value={servicoId}
              onChange={(event) =>
                setServicoId(event.target.value)
              }
              required
            >

              <option value="">
                Selecione um serviço
              </option>

              {/*
              Mostra somente serviços ativos.
              */}
              {servicos
                .filter((servico) =>
                  Boolean(servico.ativo)
                )
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


          {/* Data */}
          <div className="campo">

            <label htmlFor="data">
              Data
            </label>

            <input
              id="data"
              type="date"
              value={data}
              onChange={(event) =>
                setData(event.target.value)
              }
              required
            />

          </div>


          {/* Hora */}
          <div className="campo">

            <label htmlFor="hora">
              Hora
            </label>

            <input
              id="hora"
              type="time"
              value={hora}
              onChange={(event) =>
                setHora(event.target.value)
              }
              required
            />

          </div>


          {/* Status */}
          <div className="campo">

            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
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


          {/* Observações */}
          <div className="campo campo-largo">

            <label htmlFor="observacoes">
              Observações
            </label>

            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(event) =>
                setObservacoes(event.target.value)
              }
              rows="4"
            />

          </div>


          {/* Botões */}
          <div className="formulario-acoes">

            <button
              className="botao-principal"
              type="submit"
            >
              {agendamentoEditando
                ? 'Salvar alterações'
                : 'Criar agendamento'}
            </button>

            {agendamentoEditando && (

              <button
                className="botao-secundario"
                type="button"
                onClick={cancelarEdicao}
              >
                Cancelar
              </button>

            )}

          </div>

        </form>

      </section>


      {/* ============================= */}
      {/* MENSAGEM */}
      {/* ============================= */}

      {mensagem && (

        <p
          className={`mensagem ${tipoMensagem}`}
        >
          {mensagem}
        </p>

      )}


      {/* ============================= */}
      {/* LISTA DE AGENDAMENTOS */}
      {/* ============================= */}

      <section className="lista-card">

        <h2>
          Agendamentos cadastrados
        </h2>

        {agendamentos.length === 0 ? (

          <p>
            Nenhum agendamento cadastrado.
          </p>

        ) : (

          <div className="tabela-container">

            <table className="tabela">

              <thead>

                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Funcionário</th>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {agendamentos.map((agendamento) => (

                  <tr key={agendamento.id}>

                    {/* Cliente */}
                    <td>
                      {agendamento.cliente?.nome}
                    </td>

                    {/* Serviço */}
                    <td>
                      {agendamento.servico?.nome}
                    </td>

                    {/* Funcionário */}
                    <td>
                      {agendamento.funcionario?.name}
                    </td>

                    {/* Data */}
                    <td>
                      {formatarData(agendamento.data)}
                    </td>

                    {/* Hora */}
                    <td>
                      {agendamento.hora.slice(0, 5)}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status status-${agendamento.status}`}
                      >
                        {formatarStatus(agendamento.status)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="tabela-acoes">

                      <button
                        className="botao-editar"
                        onClick={() =>
                          editarAgendamento(
                            agendamento
                          )
                        }
                      >
                        Editar
                      </button>

                      {usuario?.perfil === 'admin' && (

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            removerAgendamento(
                              agendamento.id
                            )
                          }
                        >
                          Excluir
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Agendamentos;
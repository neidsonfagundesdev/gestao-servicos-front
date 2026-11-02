import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  listarServicos,
  criarServico,
  atualizarServico,
  excluirServico,
} from '../services/api';

function Servicos() {
  /*
  Guarda a lista de serviços recebida da API.
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
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracao, setDuracao] = useState('');
  const [preco, setPreco] = useState('');

  /*
  true  = serviço ativo
  false = serviço inativo
  */
  const [ativo, setAtivo] = useState(true);

  /*
  Guarda qual serviço está sendo editado.

  null = novo serviço
  objeto = edição
  */
  const [servicoEditando, setServicoEditando] = useState(null);

  /*
  Recupera o usuário logado.

  Precisamos disso para saber
  se ele é administrador.
  */
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  /*
  Permite redirecionar para outra rota.
  */
  const navigate = useNavigate();

  /*
  Busca novamente os serviços.

  Usamos depois de:
  - cadastrar
  - editar
  - excluir
  */
  async function carregarServicos() {
    try {
      const dados = await listarServicos();

      setServicos(dados.servicos);

    } catch (error) {
      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      setMensagem(
        'Não foi possível carregar os serviços.'
      );

      setTipoMensagem('erro');
    }
  }

  /*
  Executa quando a página é aberta.
  */
  useEffect(() => {
    async function buscarServicos() {
      try {
        const dados = await listarServicos();

        setServicos(dados.servicos);

      } catch (error) {
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        setMensagem(
          'Não foi possível carregar os serviços.'
        );

        setTipoMensagem('erro');
      }
    }

    buscarServicos();

  }, [navigate]);

  /*
  Limpa o formulário.
  */
  function limparFormulario() {
    setNome('');
    setDescricao('');
    setDuracao('');
    setPreco('');
    setAtivo(true);

    setServicoEditando(null);
  }

  /*
  Executado quando o formulário é enviado.

  Pode criar ou atualizar.
  */
  async function handleSubmit(event) {
    event.preventDefault();

    /*
    Limpa mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');

    /*
    Objeto enviado para o backend.
    */
    const servico = {
      nome,
      descricao,
      duracao_minutos: Number(duracao),
      preco: Number(preco),
      ativo,
    };

    try {
      /*
      Se existe serviço sendo editado,
      fazemos PATCH.
      */
      if (servicoEditando) {
        await atualizarServico(
          servicoEditando.id,
          servico
        );

        setMensagem(
          'Serviço atualizado com sucesso.'
        );

        setTipoMensagem('sucesso');

      } else {
        /*
        Caso contrário,
        criamos um novo serviço.
        */
        await criarServico(servico);

        setMensagem(
          'Serviço cadastrado com sucesso.'
        );

        setTipoMensagem('sucesso');
      }

      /*
      Limpa o formulário.
      */
      limparFormulario();

      /*
      Atualiza a tabela.
      */
      await carregarServicos();

    } catch (error) {
      setMensagem(error.message);

      setTipoMensagem('erro');
    }
  }

  /*
  Coloca o serviço no formulário
  para edição.
  */
  function editarServico(servico) {
    setServicoEditando(servico);

    setNome(servico.nome);

    setDescricao(
      servico.descricao ?? ''
    );

    setDuracao(
      String(servico.duracao_minutos)
    );

    setPreco(
      String(servico.preco)
    );

    setAtivo(
      Boolean(servico.ativo)
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
  Exclui um serviço.
  */
  async function removerServico(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este serviço?'
    );

    if (!confirmar) {
      return;
    }

    setMensagem('');
    setTipoMensagem('');

    try {
      await excluirServico(id);

      setMensagem(
        'Serviço excluído com sucesso.'
      );

      setTipoMensagem('sucesso');

      await carregarServicos();

    } catch (error) {
      setMensagem(error.message);

      setTipoMensagem('erro');
    }
  }

  return (
    <div className="pagina">

      {/* ============================= */}
      {/* CABEÇALHO */}
      {/* ============================= */}

      <div className="pagina-cabecalho">
        <div>
          <h1>Serviços</h1>

          <p>
            Cadastre e gerencie os serviços oferecidos.
          </p>
        </div>
      </div>


      {/* ============================= */}
      {/* FORMULÁRIO */}
      {/* ============================= */}

      {/*
      Somente administrador vê
      o formulário.
      */}
      {usuario?.perfil === 'admin' && (

        <section className="formulario-card">

          <h2>
            {servicoEditando
              ? 'Editar serviço'
              : 'Novo serviço'}
          </h2>

          <form
            className="formulario"
            onSubmit={handleSubmit}
          >

            {/* Nome */}
            <div className="campo">
              <label htmlFor="nome">
                Nome
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                required
              />
            </div>


            {/* Duração */}
            <div className="campo">
              <label htmlFor="duracao">
                Duração em minutos
              </label>

              <input
                id="duracao"
                type="number"
                min="1"
                value={duracao}
                onChange={(event) =>
                  setDuracao(event.target.value)
                }
                required
              />
            </div>


            {/* Preço */}
            <div className="campo">
              <label htmlFor="preco">
                Preço
              </label>

              <input
                id="preco"
                type="number"
                min="0"
                step="0.01"
                value={preco}
                onChange={(event) =>
                  setPreco(event.target.value)
                }
                required
              />
            </div>


            {/* Situação */}
            <div className="campo">

              <label>
                Situação
              </label>

              <label className="checkbox-campo">

                <input
                  id="ativo"
                  type="checkbox"
                  checked={ativo}
                  onChange={(event) =>
                    setAtivo(event.target.checked)
                  }
                />

                <span>
                  Serviço ativo
                </span>

              </label>

            </div>


            {/* Descrição */}
            <div className="campo campo-largo">

              <label htmlFor="descricao">
                Descrição
              </label>

              <textarea
                id="descricao"
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
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
                {servicoEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar serviço'}
              </button>

              {servicoEditando && (

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
      )}


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
      {/* LISTA DE SERVIÇOS */}
      {/* ============================= */}

      <section className="lista-card">

        <h2>
          Serviços cadastrados
        </h2>

        {servicos.length === 0 ? (

          <p>
            Nenhum serviço cadastrado.
          </p>

        ) : (

          <div className="tabela-container">

            <table className="tabela">

              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Duração</th>
                  <th>Preço</th>
                  <th>Situação</th>

                  {usuario?.perfil === 'admin' && (
                    <th>Ações</th>
                  )}
                </tr>
              </thead>

              <tbody>

                {servicos.map((servico) => (

                  <tr key={servico.id}>

                    <td>
                      {servico.nome}
                    </td>

                    <td>
                      {servico.duracao_minutos} min
                    </td>

                    <td>
                      R$ {Number(servico.preco).toFixed(2)}
                    </td>

                    <td>
                      {servico.ativo
                        ? 'Ativo'
                        : 'Inativo'}
                    </td>

                    {usuario?.perfil === 'admin' && (

                      <td className="tabela-acoes">

                        <button
                          className="botao-editar"
                          onClick={() =>
                            editarServico(servico)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            removerServico(servico.id)
                          }
                        >
                          Excluir
                        </button>

                      </td>

                    )}

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

export default Servicos;
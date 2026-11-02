import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  listarClientes,
  criarCliente,
  atualizarCliente,
  excluirCliente,
} from '../services/api';

function Clientes() {
  /*
  Guarda a lista de clientes recebida da API.
  */
  const [clientes, setClientes] = useState([]);

  /*
  Guarda o texto da mensagem.

  Ex:
  "Cliente cadastrado com sucesso."
  "Não foi possível carregar os clientes."
  */
  const [mensagem, setMensagem] = useState('');

  /*
  Guarda o tipo da mensagem.

  Pode ser:
  "sucesso"
  ou
  "erro"

  Esse valor será usado no CSS
  para mudar a aparência da mensagem.
  */
  const [tipoMensagem, setTipoMensagem] = useState('');

  /*
  Campos do formulário.
  */
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');

  /*
  Guarda o cliente que está sendo editado.

  null = estamos cadastrando um cliente novo.

  objeto = estamos editando um cliente existente.
  */
  const [clienteEditando, setClienteEditando] = useState(null);

  /*
  Recupera o usuário logado que foi salvo
  no localStorage durante o login.

  Precisamos disso para saber se ele é admin
  e pode visualizar o botão Excluir.
  */
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  /*
  Permite redirecionar para outra página.

  Ex:
  se o token deixar de ser válido,
  podemos voltar para /login.
  */
  const navigate = useNavigate();

  /*
  Busca os clientes no backend.

  Essa função será usada depois de:
  - cadastrar
  - editar
  - excluir

  Assim atualizamos a tabela.
  */
  async function carregarClientes() {
    try {
      const dados = await listarClientes();

      /*
      O backend retorna:

      {
        clientes: [...]
      }

      Por isso usamos dados.clientes.
      */
      setClientes(dados.clientes);

    } catch (error) {

      /*
      Se o token não for mais válido,
      voltamos para o login.
      */
      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      /*
      Qualquer outro erro ao buscar clientes.
      */
      setMensagem(
        'Não foi possível carregar os clientes.'
      );

      setTipoMensagem('erro');
    }
  }

  /*
  Executa quando a página Clientes é aberta.

  Faz a primeira busca dos clientes.
  */
  useEffect(() => {
    /*
    Criamos a função assíncrona
    dentro do useEffect.

    Isso evita o aviso do ESLint
    que vimos anteriormente.
    */
    async function buscarClientes() {
      try {
        const dados = await listarClientes();

        setClientes(dados.clientes);

      } catch (error) {

        /*
        Token inválido ou expirado.
        */
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        /*
        Outro erro qualquer.
        */
        setMensagem(
          'Não foi possível carregar os clientes.'
        );

        setTipoMensagem('erro');
      }
    }

    buscarClientes();

  }, [navigate]);

  /*
  Limpa todos os campos do formulário.

  Também sai do modo de edição.
  */
  function limparFormulario() {
    setNome('');
    setTelefone('');
    setEmail('');
    setObservacoes('');

    /*
    null significa que não estamos
    editando nenhum cliente.
    */
    setClienteEditando(null);
  }

  /*
  Executado quando o formulário é enviado.

  Pode criar ou atualizar um cliente.
  */
  async function handleSubmit(event) {
    /*
    Impede o navegador de recarregar
    a página inteira.
    */
    event.preventDefault();

    /*
    Antes de uma nova operação,
    limpamos mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');

    /*
    Montamos o objeto que será enviado
    para o backend.
    */
    const cliente = {
      nome,
      telefone,
      email,
      observacoes,
    };

    try {
      /*
      Se existe clienteEditando,
      fazemos PATCH.
      */
      if (clienteEditando) {

        await atualizarCliente(
          clienteEditando.id,
          cliente
        );

        /*
        Mensagem de sucesso da edição.
        */
        setMensagem(
          'Cliente atualizado com sucesso.'
        );

        setTipoMensagem('sucesso');

      } else {

        /*
        Se não estamos editando,
        fazemos POST e criamos um novo cliente.
        */
        await criarCliente(cliente);

        /*
        Mensagem de sucesso do cadastro.
        */
        setMensagem(
          'Cliente cadastrado com sucesso.'
        );

        setTipoMensagem('sucesso');
      }

      /*
      Depois de salvar,
      limpamos o formulário.
      */
      limparFormulario();

      /*
      Busca novamente os clientes
      para atualizar a tabela.
      */
      await carregarClientes();

    } catch (error) {

      /*
      Mostra a mensagem de erro
      retornada pelo tratamento da API.
      */
      setMensagem(error.message);

      setTipoMensagem('erro');
    }
  }

  /*
  Coloca os dados de um cliente
  dentro do formulário para edição.
  */
  function editarCliente(cliente) {
    /*
    Guarda qual cliente está sendo editado.
    */
    setClienteEditando(cliente);

    /*
    Preenche os campos do formulário
    com os dados daquele cliente.
    */
    setNome(cliente.nome);

    setTelefone(cliente.telefone);

    /*
    Se email for null,
    usamos uma string vazia.
    */
    setEmail(
      cliente.email ?? ''
    );

    /*
    Se observações forem null,
    usamos uma string vazia.
    */
    setObservacoes(
      cliente.observacoes ?? ''
    );

    /*
    Limpa mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');
  }

  /*
  Cancela uma edição.

  Limpa o formulário
  e volta para o modo de cadastro.
  */
  function cancelarEdicao() {
    limparFormulario();

    /*
    Também limpamos mensagens anteriores.
    */
    setMensagem('');
    setTipoMensagem('');
  }

  /*
  Exclui um cliente.
  */
  async function removerCliente(id) {
    /*
    Abre a confirmação do navegador.

    Isso evita exclusões acidentais.
    */
    const confirmar = window.confirm(
      'Deseja realmente excluir este cliente?'
    );

    /*
    Se clicar em Cancelar,
    interrompemos a função.
    */
    if (!confirmar) {
      return;
    }

    /*
    Limpa mensagens anteriores antes
    de tentar a exclusão.
    */
    setMensagem('');
    setTipoMensagem('');

    try {
      /*
      Faz DELETE no backend.
      */
      await excluirCliente(id);

      /*
      Mensagem de sucesso.
      */
      setMensagem(
        'Cliente excluído com sucesso.'
      );

      setTipoMensagem('sucesso');

      /*
      Busca novamente os clientes
      para atualizar a tabela.
      */
      await carregarClientes();

    } catch (error) {

      /*
      Mostra o erro retornado pela API.
      */
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
          <h1>
            Clientes
          </h1>

          <p>
            Cadastre e gerencie os clientes do sistema.
          </p>
        </div>
      </div>


      {/* ============================= */}
      {/* FORMULÁRIO */}
      {/* ============================= */}

      <section className="formulario-card">

        <h2>
          {/*
          O título muda dependendo
          se estamos criando ou editando.
          */}
          {clienteEditando
            ? 'Editar cliente'
            : 'Novo cliente'}
        </h2>

        <form
          className="formulario"
          onSubmit={handleSubmit}
        >

          {/* ============================= */}
          {/* NOME */}
          {/* ============================= */}

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


          {/* ============================= */}
          {/* TELEFONE */}
          {/* ============================= */}

          <div className="campo">

            <label htmlFor="telefone">
              Telefone
            </label>

            <input
              id="telefone"
              type="text"
              value={telefone}
              onChange={(event) =>
                setTelefone(event.target.value)
              }
              required
            />

          </div>


          {/* ============================= */}
          {/* E-MAIL */}
          {/* ============================= */}

          <div className="campo">

            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

          </div>


          {/* ============================= */}
          {/* OBSERVAÇÕES */}
          {/* ============================= */}

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


          {/* ============================= */}
          {/* BOTÕES DO FORMULÁRIO */}
          {/* ============================= */}

          <div className="formulario-acoes">

            <button
              className="botao-principal"
              type="submit"
            >
              {/*
              O texto do botão muda
              conforme o modo atual.
              */}
              {clienteEditando
                ? 'Salvar alterações'
                : 'Cadastrar cliente'}
            </button>


            {/*
            O botão Cancelar só aparece
            durante uma edição.
            */}
            {clienteEditando && (

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

      {/*
      A mensagem recebe duas classes.

      Exemplo de sucesso:

      mensagem sucesso

      Exemplo de erro:

      mensagem erro

      O CSS usa essas classes para decidir
      se a caixa será verde ou vermelha.
      */}
      {mensagem && (

        <p
          className={`mensagem ${tipoMensagem}`}
        >
          {mensagem}
        </p>

      )}


      {/* ============================= */}
      {/* LISTA DE CLIENTES */}
      {/* ============================= */}

      <section className="lista-card">

        <h2>
          Clientes cadastrados
        </h2>

        {/*
        Se não houver clientes,
        mostramos uma mensagem.

        Caso contrário,
        mostramos a tabela.
        */}
        {clientes.length === 0 ? (

          <p>
            Nenhum cliente cadastrado.
          </p>

        ) : (

          /*
          Permite rolagem horizontal
          caso a tabela não caiba na tela.
          */
          <div className="tabela-container">

            <table className="tabela">

              {/* Cabeçalho */}
              <thead>

                <tr>
                  <th>Nome</th>

                  <th>Telefone</th>

                  <th>E-mail</th>

                  <th>Ações</th>
                </tr>

              </thead>


              {/* Dados */}
              <tbody>

                {/*
                map percorre os clientes.

                É parecido com foreach no PHP.
                */}
                {clientes.map((cliente) => (

                  <tr key={cliente.id}>

                    {/* Nome */}
                    <td>
                      {cliente.nome}
                    </td>


                    {/* Telefone */}
                    <td>
                      {cliente.telefone}
                    </td>


                    {/* E-mail */}
                    <td>
                      {/*
                      Se não houver e-mail,
                      mostramos "-".
                      */}
                      {cliente.email || '-'}
                    </td>


                    {/* Ações */}
                    <td className="tabela-acoes">

                      {/*
                      Todos os usuários autenticados
                      podem editar clientes.
                      */}
                      <button
                        className="botao-editar"
                        onClick={() =>
                          editarCliente(cliente)
                        }
                      >
                        Editar
                      </button>


                      {/*
                      Somente o administrador
                      vê o botão Excluir.

                      IMPORTANTE:
                      isso é apenas controle visual.

                      O backend continua fazendo
                      a verificação real de segurança.
                      */}
                      {usuario?.perfil === 'admin' && (

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            removerCliente(cliente.id)
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

export default Clientes;
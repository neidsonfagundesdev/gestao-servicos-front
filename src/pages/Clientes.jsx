import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes, criarCliente, atualizarCliente, excluirCliente } from '../services/api';

function Clientes() {
  // Guarda a lista de clientes recebida da API
  const [clientes, setClientes] = useState([]);

  // Guarda mensagens para mostrar na tela
  // Ex: "Carregando...", "Cliente cadastrado com sucesso.", erros etc.
  const [mensagem, setMensagem] = useState('Carregando...');

  // Guarda o que o usuário digita no campo nome
  const [nome, setNome] = useState('');

  // Guarda o que o usuário digita no campo telefone
  const [telefone, setTelefone] = useState('');

  // Guarda o que o usuário digita no campo email
  const [email, setEmail] = useState('');

  // Guarda o que o usuário digita no campo observações
  const [observacoes, setObservacoes] = useState('');

  /*
  Guarda o ID do cliente que está sendo editado.

  null = nenhum cliente está sendo editado
  3 = estamos editando o cliente de ID 3
  */
  const [clienteEditando, setClienteEditando] = useState(null);

  // Recupera os dados do usuário que fez login
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  // Permite navegar para outra rota do React
  // Ex: mandar o usuário de volta para /login
  const navigate = useNavigate();

  /*
  useEffect executa quando a página Clientes é aberta.

  Ele chama a API para buscar os clientes cadastrados
  e coloca os dados dentro do estado "clientes".
  */
  useEffect(() => {
    async function carregarClientes() {
      try {
        // Busca os clientes na API Laravel
        const dados = await listarClientes();

        // Salva o array de clientes recebido da API
        setClientes(dados.clientes);

        // Limpa a mensagem "Carregando..."
        setMensagem('');
      } catch (error) {
        // Se o token não for mais válido, volta para o login
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        // Caso aconteça outro erro
        setMensagem('Não foi possível carregar os clientes.');
      }
    }

    // Executa a função criada acima
    carregarClientes();
  }, [navigate]);

  /*
  Executa quando o usuário envia o formulário.

  Essa mesma função serve tanto para:

  POST  -> cadastrar novo cliente
  PATCH -> atualizar cliente existente
  */
  async function handleSubmit(event) {
    // Impede o navegador de recarregar a página
    event.preventDefault();

    try {
      /*
      Monta um objeto com os dados atuais do formulário.

      Ex:
      {
        nome: "João",
        telefone: "71999999999",
        email: "joao@email.com",
        observacoes: "Cliente..."
      }
      */
      const dadosCliente = {
        nome,
        telefone,
        email,
        observacoes,
      };

      /*
      Se clienteEditando tiver um ID,
      significa que clicamos anteriormente no botão Editar.

      Então fazemos PATCH.
      */
      if (clienteEditando) {
        await atualizarCliente(clienteEditando, dadosCliente);

        setMensagem('Cliente atualizado com sucesso.');
      } else {
        /*
        Se clienteEditando for null,
        significa que estamos cadastrando um cliente novo.

        Então fazemos POST.
        */
        await criarCliente(dadosCliente);

        setMensagem('Cliente cadastrado com sucesso.');
      }

      /*
      Depois de cadastrar ou atualizar,
      limpamos os campos do formulário.
      */
      setNome('');
      setTelefone('');
      setEmail('');
      setObservacoes('');

      // Sai do modo de edição
      setClienteEditando(null);

      /*
      Busca novamente os clientes na API
      para atualizar a lista na tela.
      */
      const dados = await listarClientes();

      setClientes(dados.clientes);
    } catch (error) {
      // Token inválido ou revogado
      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      // Outro erro durante cadastro ou atualização
      setMensagem('Não foi possível salvar o cliente.');
    }
  }

  /*
  Executa quando clicamos no botão Editar.

  Recebe o cliente que foi clicado e coloca
  os dados dele dentro dos campos do formulário.
  */
  function editarCliente(cliente) {
    // Guarda o ID do cliente que está sendo editado
    setClienteEditando(cliente.id);

    // Preenche os campos do formulário
    setNome(cliente.nome);
    setTelefone(cliente.telefone);

    /*
    Se email for null, usamos uma string vazia.
    Isso evita problemas no input do React.
    */
    setEmail(cliente.email || '');

    // Faz o mesmo para observações
    setObservacoes(cliente.observacoes || '');
  }

  /*
  Cancela a edição atual.

  Limpa os campos e volta o formulário
  para o modo de cadastro.
  */
  function cancelarEdicao() {
    // Nenhum cliente está sendo editado
    setClienteEditando(null);

    // Limpa os campos
    setNome('');
    setTelefone('');
    setEmail('');
    setObservacoes('');

    // Limpa mensagens da tela
    setMensagem('');
  }

  /*
  Exclui um cliente.

  Recebe o ID do cliente clicado,
  pede confirmação e chama a API.
  */
  async function deletarCliente(id) {
  /*
  window.confirm abre uma caixa perguntando
  se o usuário realmente quer excluir.

  OK      -> true
  Cancelar -> false
  */
  const confirmou = window.confirm(
    'Tem certeza que deseja excluir este cliente?'
  );

  // Se clicar em Cancelar, interrompe aqui
  if (!confirmou) {
    return;
  }

  try {
    // Faz DELETE /api/clientes/{id}
    await excluirCliente(id);

    /*
    Depois que o Laravel excluir,
    buscamos novamente os clientes
    para atualizar a lista da tela.
    */
    const dados = await listarClientes();

    setClientes(dados.clientes);

    setMensagem('Cliente excluído com sucesso.');

  } catch (error) {
    // Se o token estiver inválido
    if (error.message === 'Não autenticado.') {
      navigate('/login');
      return;
    }

    /*
    Se estiver autenticado mas não for admin,
    o Laravel retorna 403.
    */
    if (error.message === 'Sem permissão.') {
      setMensagem(
        'Você não possui permissão para excluir clientes.'
      );
      return;
    }

    // Qualquer outro erro
    setMensagem('Não foi possível excluir o cliente.');
  }
}

  return (
    <div>
      <h1>Clientes</h1>

      {/*
      Se clienteEditando tiver um ID,
      mostramos "Editar cliente".

      Caso contrário mostramos "Cadastrar cliente".
      */}
      <h2>
        {clienteEditando ? 'Editar cliente' : 'Cadastrar cliente'}
      </h2>

      {/* Formulário de cadastro/edição */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>

          <input
            type="text"

            // O valor do input vem do estado nome
            value={nome}

            /*
            Toda vez que o usuário digita,
            atualizamos o estado nome.
            */
            onChange={(event) => setNome(event.target.value)}
          />
        </div>

        <div>
          <label>Telefone</label>

          <input
            type="text"
            value={telefone}
            onChange={(event) => setTelefone(event.target.value)}
          />
        </div>

        <div>
          <label>E-mail</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Observações</label>

          <textarea
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
          />
        </div>

        {/*
        O texto do botão muda automaticamente.

        Se estiver editando:
        "Salvar alteração"

        Se não estiver:
        "Cadastrar cliente"
        */}
        <button type="submit">
          {clienteEditando ? 'Salvar alteração' : 'Cadastrar cliente'}
        </button>

        {/*
        Esse botão só aparece quando existe
        um cliente sendo editado.
        */}
        {clienteEditando && (
          <button type="button" onClick={cancelarEdicao}>
            Cancelar edição
          </button>
        )}
      </form>

      {/* Mostra mensagens de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <h2>Clientes cadastrados</h2>

      {/*
      Percorre o array de clientes.

      É parecido com um foreach no PHP.
      */}
      {clientes.map((cliente) => (
        <div key={cliente.id}>
          <p>Nome: {cliente.nome}</p>

          <p>Telefone: {cliente.telefone}</p>

          <p>
            E-mail: {cliente.email || 'Não informado'}
          </p>

          {/*
          Ao clicar, enviamos aquele cliente
          para a função editarCliente().
          */}
          <button onClick={() => editarCliente(cliente)}>
            Editar
          </button>

          {/* Somente administrador pode ver o botão Excluir */}  
          {usuario?.perfil === 'admin' && (
            <button onClick={() => deletarCliente(cliente.id)}>
              Excluir
            </button>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Clientes;
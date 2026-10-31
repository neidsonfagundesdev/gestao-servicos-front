import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  listarServicos,
  criarServico,
  atualizarServico,
  excluirServico
} from '../services/api';

function Servicos() {
  // Guarda a lista de serviços recebida da API
  const [servicos, setServicos] = useState([]);

  // Guarda mensagens para mostrar na tela
  // Ex: "Carregando...", "Serviço atualizado com sucesso.", erros etc.
  const [mensagem, setMensagem] = useState('Carregando...');

  // Guarda o que o usuário digita no campo nome
  const [nome, setNome] = useState('');

  // Guarda o que o usuário digita na descrição
  const [descricao, setDescricao] = useState('');

  // Guarda a duração em minutos
  const [duracaoMinutos, setDuracaoMinutos] = useState('');

  // Guarda o preço
  const [preco, setPreco] = useState('');

  // Guarda se o serviço está ativo
  // true = ativo
  // false = inativo
  const [ativo, setAtivo] = useState(true);

  /*
  Guarda o ID do serviço que está sendo editado.

  null = estamos cadastrando um novo serviço
  3    = estamos editando o serviço de ID 3
  */
  const [servicoEditando, setServicoEditando] = useState(null);

  /*
  Recupera os dados do usuário que fez login.

  Isso permite saber se ele é:
  admin
  ou
  funcionario
  */
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  // Permite navegar para outras rotas
  const navigate = useNavigate();

  /*
  Executa quando a página Serviços é aberta.

  Busca os serviços no Laravel e coloca
  os dados dentro do estado "servicos".
  */
  useEffect(() => {
    async function carregarServicos() {
      try {
        // Faz GET /api/servicos
        const dados = await listarServicos();

        // Salva o array de serviços
        setServicos(dados.servicos);

        // Limpa a mensagem "Carregando..."
        setMensagem('');
      } catch (error) {
        // Se o token estiver inválido ou revogado
        if (error.message === 'Não autenticado.') {
          navigate('/login');
          return;
        }

        setMensagem('Não foi possível carregar os serviços.');
      }
    }

    carregarServicos();
  }, [navigate]);

  /*
  Executa quando o formulário é enviado.

  Essa mesma função serve para:

  POST  -> cadastrar novo serviço
  PATCH -> atualizar serviço existente
  */
  async function handleSubmit(event) {
    // Impede a página de recarregar
    event.preventDefault();

    try {
      /*
      Monta o objeto que será enviado ao Laravel.

      Number() transforma o texto do input
      em número.
      */
      const dadosServico = {
        nome,
        descricao,
        duracao_minutos: Number(duracaoMinutos),
        preco: Number(preco),
        ativo,
      };

      /*
      Se servicoEditando tiver um ID,
      significa que estamos editando.

      Então fazemos PATCH.
      */
      if (servicoEditando) {
        await atualizarServico(
          servicoEditando,
          dadosServico
        );

        setMensagem('Serviço atualizado com sucesso.');
      } else {
        /*
        Se servicoEditando for null,
        significa que estamos cadastrando.

        Então fazemos POST.
        */
        await criarServico(dadosServico);

        setMensagem('Serviço cadastrado com sucesso.');
      }

      /*
      Depois do cadastro ou edição,
      limpamos os campos do formulário.
      */
      setNome('');
      setDescricao('');
      setDuracaoMinutos('');
      setPreco('');
      setAtivo(true);

      // Sai do modo de edição
      setServicoEditando(null);

      /*
      Busca novamente a lista para atualizar
      a tela com os dados mais recentes.
      */
      const dados = await listarServicos();

      setServicos(dados.servicos);

    } catch (error) {
      // Token inválido ou revogado
      if (error.message === 'Não autenticado.') {
        navigate('/login');
        return;
      }

      setMensagem('Não foi possível salvar o serviço.');
    }
  }

  /*
  Executa quando clicamos no botão Editar.

  Recebe o serviço clicado e coloca os dados
  dele dentro dos campos do formulário.
  */
  function editarServico(servico) {
    // Guarda o ID do serviço que será editado
    setServicoEditando(servico.id);

    // Preenche os campos do formulário
    setNome(servico.nome);

    // Se descrição for null, usa string vazia
    setDescricao(servico.descricao || '');

    // Preenche duração
    setDuracaoMinutos(servico.duracao_minutos);

    // Preenche preço
    setPreco(servico.preco);

    /*
    Converte o valor para verdadeiro ou falso.

    Isso ajuda porque o Laravel/MySQL pode
    devolver 1 ou 0.
    */
    setAtivo(Boolean(servico.ativo));
  }

  /*
  Cancela a edição atual.

  Limpa o formulário e volta
  para o modo de cadastro.
  */
  function cancelarEdicao() {
    setServicoEditando(null);

    setNome('');
    setDescricao('');
    setDuracaoMinutos('');
    setPreco('');
    setAtivo(true);

    setMensagem('');
  }

  /*
  Exclui um serviço.

  Recebe o ID do serviço clicado,
  pede confirmação e chama a API.
*/
  async function deletarServico(id) {
  /*
  Abre uma confirmação no navegador.

  OK       -> true
  Cancelar -> false
  */
  const confirmou = window.confirm(
    'Tem certeza que deseja excluir este serviço?'
  );

  // Se cancelar, para aqui
  if (!confirmou) {
    return;
  }

  try {
    // Faz DELETE /api/servicos/{id}
    await excluirServico(id);

    /*
    Depois da exclusão, busca novamente
    os serviços para atualizar a tela.
    */
    const dados = await listarServicos();

    setServicos(dados.servicos);

    setMensagem('Serviço excluído com sucesso.');
  } catch (error) {
    // Token inválido
    if (error.message === 'Não autenticado.') {
    navigate('/login');
    return;
    }

    // Usuário sem permissão
    if (error.message === 'Sem permissão.') {
    setMensagem(
        'Você não possui permissão para excluir serviços.'
    );
    return;
    }

    setMensagem('Não foi possível excluir o serviço.');
  }
}

  return (
    <div>
      <h1>Serviços</h1>

      {/*
      Somente admin vê o formulário.

      Funcionário pode visualizar,
      mas não pode cadastrar nem editar.
      */}
      {usuario?.perfil === 'admin' && (
        <>
          <h2>
            {servicoEditando
              ? 'Editar serviço'
              : 'Cadastrar serviço'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label>Nome</label>

              <input
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
              />
            </div>

            <div>
              <label>Descrição</label>

              <textarea
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
              />
            </div>

            <div>
              <label>Duração em minutos</label>

              <input
                type="number"
                value={duracaoMinutos}
                onChange={(event) =>
                  setDuracaoMinutos(event.target.value)
                }
              />
            </div>

            <div>
              <label>Preço</label>

              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={(event) =>
                  setPreco(event.target.value)
                }
              />
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(event) =>
                    setAtivo(event.target.checked)
                  }
                />

                Serviço ativo
              </label>
            </div>

            {/*
            O texto do botão muda dependendo
            se estamos cadastrando ou editando.
            */}
            <button type="submit">
              {servicoEditando
                ? 'Salvar alteração'
                : 'Cadastrar serviço'}
            </button>

            {/*
            Esse botão só aparece
            quando estamos editando.
            */}
            {servicoEditando && (
              <button
                type="button"
                onClick={cancelarEdicao}
              >
                Cancelar edição
              </button>
            )}
          </form>
        </>
      )}

      {/* Mostra mensagens de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <h2>Serviços cadastrados</h2>

      {/*
      Percorre os serviços recebidos da API.

      É parecido com foreach no PHP.
      */}
      {servicos.map((servico) => (
        <div key={servico.id}>
          <p>Nome: {servico.nome}</p>

          <p>
            Descrição: {servico.descricao || 'Não informada'}
          </p>

          <p>
            Duração: {servico.duracao_minutos} minutos
          </p>

          <p>
            Preço: R$ {servico.preco}
          </p>

          <p>
            Status: {servico.ativo ? 'Ativo' : 'Inativo'}
          </p>

          {/*
          Somente admin vê o botão Editar.
          */}
          {usuario?.perfil === 'admin' && (
            <button
              onClick={() => editarServico(servico)}
            >
              Editar
            </button>
          )}
          
          {/* Somente admin pode excluir */}  
          {usuario?.perfil === 'admin' && (
            <button
              onClick={() => deletarServico(servico.id)}
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

export default Servicos;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  /*
  Guarda o valor digitado no campo de e-mail.
  */
  const [email, setEmail] = useState('');

  /*
  Guarda o valor digitado no campo de senha.
  */
  const [password, setPassword] = useState('');

  /*
  Guarda mensagens de erro.
  */
  const [mensagem, setMensagem] = useState('');

  /*
  Permite navegar para outra rota.
  */
  const navigate = useNavigate();

  /*
  Executado quando o formulário é enviado.
  */
  async function handleSubmit(event) {
    /*
    Impede o navegador de recarregar a página.
    */
    event.preventDefault();

    // Limpa mensagens anteriores
    setMensagem('');

    try {
      /*
      Faz a requisição para o endpoint de login.
      */
      const response = await fetch(
        'http://127.0.0.1:8000/api/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },

          /*
          Envia e-mail e senha para o Laravel.
          */
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      /*
      Converte a resposta para JSON.
      */
      const dados = await response.json();

      /*
      Se a resposta não for sucesso,
      mostramos o erro retornado pelo backend.
      */
      if (!response.ok) {
        setMensagem(
          dados.erro || 'Não foi possível entrar.'
        );

        return;
      }

      /*
      Salva o token no navegador.

      Esse token será usado nas próximas
      requisições autenticadas.
      */
      localStorage.setItem(
        'token',
        dados.token
      );

      /*
      Salva os dados do usuário.

      JSON.stringify transforma o objeto
      em texto para poder salvar no localStorage.
      */
      localStorage.setItem(
        'usuario',
        JSON.stringify(dados.usuario)
      );

      /*
      Depois do login,
      enviamos o usuário para o Dashboard.
      */
      navigate('/dashboard');

    } catch {
      /*
      Esse erro pode acontecer se:
      - backend estiver desligado
      - endereço estiver errado
      - houver problema de conexão
      */
      setMensagem(
        'Não foi possível conectar ao servidor.'
      );
    }
  }

  return (
    /*
    Área que ocupa toda a tela.

    Usamos essa div para centralizar
    o card de login.
    */
    <div className="login-pagina">

      {/*
      Card branco do formulário.
      */}
      <div className="login-card">

        {/* Cabeçalho */}
        <div className="login-cabecalho">

          <h1>
            Login
          </h1>

          <p>
            Entre para acessar o sistema.
          </p>

        </div>

        {/* Formulário */}
        <form
          className="login-formulario"
          onSubmit={handleSubmit}
        >

          {/* E-mail */}
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
              placeholder="Digite seu e-mail"
              required
            />

          </div>

          {/* Senha */}
          <div className="campo">

            <label htmlFor="password">
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Digite sua senha"
              required
            />

          </div>

          {/*
          Mensagem de erro.

          Só aparece se existir alguma mensagem.
          */}
          {mensagem && (
            <p className="login-mensagem">
              {mensagem}
            </p>
          )}

          {/* Botão de entrar */}
          <button
            className="login-botao"
            type="submit"
          >
            Entrar
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
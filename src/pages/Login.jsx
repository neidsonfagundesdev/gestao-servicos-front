import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },

        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const dados = await response.json();

      if (!response.ok) {
        setMensagem(dados.erro || 'Erro ao fazer login.');
        return;
      }

      localStorage.setItem('token', dados.token);
      
      navigate('/dashboard');

    } catch {
      setMensagem('Não foi possível conectar com o servidor.');
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>E-mail</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Senha</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">
          Entrar
        </button>
      </form>

      <p>{mensagem}</p>
    </div>
  );
}

export default Login;
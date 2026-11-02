import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

function Menu() {
  // Permite mudar de rota
  const navigate = useNavigate();

  /*
  Faz logout:
  - chama o backend
  - remove token
  - remove usuário
  - volta para /login
  */
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Mesmo se o backend falhar,
      // limpamos os dados locais para encerrar a sessão no frontend.
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    navigate('/login');
  }

  return (
    <nav>
      {/* Link muda de rota sem recarregar a página */}
      <Link to="/dashboard">
        Dashboard
      </Link>

      {' | '}

      <Link to="/clientes">
        Clientes
      </Link>

      {' | '}

      <Link to="/servicos">
        Serviços
      </Link>

      {' | '}

      <Link to="/agendamentos">
        Agendamentos
      </Link>

      {' | '}

      <button onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}

export default Menu;
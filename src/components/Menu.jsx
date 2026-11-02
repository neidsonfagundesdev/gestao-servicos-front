import { NavLink, useNavigate } from 'react-router-dom';
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
      /*
      Mesmo se o backend falhar,
      limpamos os dados locais para encerrar
      a sessão no frontend.
      */
    }

    // Remove o token salvo no navegador
    localStorage.removeItem('token');

    // Remove os dados do usuário salvo
    localStorage.removeItem('usuario');

    // Volta para a página de login
    navigate('/login');
  }

  /*
  Tudo que queremos mostrar na tela
  precisa ficar dentro do return.
  */
  return (
    <nav className="menu">
      {/*
      NavLink funciona parecido com Link,
      mas sabe quando aquela rota está ativa.

      Isso permite destacar visualmente
      a página que está aberta.
      */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? 'menu-link ativo' : 'menu-link'
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/clientes"
        className={({ isActive }) =>
          isActive ? 'menu-link ativo' : 'menu-link'
        }
      >
        Clientes
      </NavLink>

      <NavLink
        to="/servicos"
        className={({ isActive }) =>
          isActive ? 'menu-link ativo' : 'menu-link'
        }
      >
        Serviços
      </NavLink>

      <NavLink
        to="/agendamentos"
        className={({ isActive }) =>
          isActive ? 'menu-link ativo' : 'menu-link'
        }
      >
        Agendamentos
      </NavLink>

      {/*
      Botão que chama a função handleLogout
      quando o usuário clicar.
      */}
      <button
        className="botao-sair"
        onClick={handleLogout}
      >
        Sair
      </button>
    </nav>
  );
}

export default Menu;
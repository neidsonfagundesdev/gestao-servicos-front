import { Outlet } from 'react-router-dom';
import Menu from './Menu';

function Layout() {
  return (
    <div>
      {/* Menu fica visível em todas as páginas internas */}
      <Menu />

      <hr />

      {/*
      Outlet é o lugar onde o React Router
      coloca a página atual.

      Ex:
      /clientes      -> Clientes.jsx
      /servicos      -> Servicos.jsx
      /agendamentos  -> Agendamentos.jsx
      */}
      <Outlet />
    </div>
  );
}

export default Layout;
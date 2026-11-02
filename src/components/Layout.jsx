import { Outlet } from 'react-router-dom';
import Menu from './Menu';
import '../App.css';

function Layout() {
  return (
    /*
    app-layout representa toda a estrutura
    das páginas internas do sistema.

    Ele envolve:
    - o menu
    - o conteúdo da página atual
    */
    <div className="app-layout">

      {/*
      O Menu fica visível em todas as páginas protegidas.

      Ex:
      /dashboard
      /clientes
      /servicos
      /agendamentos
      */}
      <Menu />

      {/*
      main representa a área principal da página.

      A classe "conteudo" será usada no CSS
      para aplicar espaçamento interno.
      */}
      <main className="conteudo">

        {/*
        Outlet é o lugar onde o React Router
        coloca a página atual.

        Ex:
        /dashboard     -> Dashboard.jsx
        /clientes      -> Clientes.jsx
        /servicos      -> Servicos.jsx
        /agendamentos  -> Agendamentos.jsx
        */}
        <Outlet />

      </main>
    </div>
  );
}

export default Layout;
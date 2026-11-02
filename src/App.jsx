import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Agendamentos from './pages/Agendamentos';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      {/* Login é público */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/*
      Tudo que estiver aqui dentro:
      - precisa estar autenticado
      - recebe o Menu através do Layout
      */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/clientes"
          element={<Clientes />}
        />

        <Route
          path="/servicos"
          element={<Servicos />}
        />

        <Route
          path="/agendamentos"
          element={<Agendamentos />}
        />
      </Route>

      {/*
      Se acessar apenas "/",
      manda para o dashboard.
      */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
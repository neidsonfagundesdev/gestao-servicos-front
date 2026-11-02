import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Agendamentos from './pages/Agendamentos';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicos"
        element={
          <ProtectedRoute>
            <Servicos />
          </ProtectedRoute>
        }
      />  

      <Route
        path="/agendamentos"
        element={
          <ProtectedRoute>
            <Agendamentos />
          </ProtectedRoute>
        }
      />    

    </Routes>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Technicians from './pages/Technicians';
import Parts from './pages/Parts';
import Users from './pages/Users';
import Login from './pages/Login';
import { getToken } from './api';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="tecnicos" element={<Technicians />} />
          <Route path="repuestos" element={<Parts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

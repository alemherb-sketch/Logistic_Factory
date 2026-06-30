import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Technicians from './pages/Technicians';
import Parts from './pages/Parts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tecnicos" element={<Technicians />} />
          <Route path="repuestos" element={<Parts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

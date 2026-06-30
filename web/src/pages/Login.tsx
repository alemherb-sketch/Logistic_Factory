import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User } from 'lucide-react';
import { API_URL, setAuth } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }
      const data = await res.json();
      if (data.user.role !== 'admin') {
        setError('Solo los administradores pueden entrar al panel web.');
        return;
      }
      setAuth(data.access_token, data.user);
      navigate('/');
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo en un momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-brand-700 text-white px-8 py-8 text-center">
          <Truck className="w-10 h-10 mx-auto mb-2 text-brand-100" />
          <h1 className="text-xl font-bold tracking-wider">LOGISTIC FACTORY</h1>
          <p className="text-xs text-brand-100 uppercase tracking-widest">Panel Administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-800 text-center">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <User className="w-5 h-5 text-slate-400" />
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 outline-none bg-transparent"
                placeholder="admin"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <Lock className="w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 outline-none bg-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold transition"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { UserCog, Trash2, ShieldCheck, Wrench } from 'lucide-react';
import { apiFetch, getUser } from '../api';

interface AppUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'technician',
  });

  const me = getUser();

  const fetchUsers = () => {
    apiFetch('/api/users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(body.detail || 'No se pudo crear la cuenta.');
        return;
      }
      setShowModal(false);
      setFormData({ username: '', password: '', full_name: '', role: 'technician' });
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: AppUser) => {
    if (!confirm(`¿Eliminar la cuenta de "${u.username}"?`)) return;
    await apiFetch(`/api/users/${u.id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Usuarios</h2>
          <p className="text-slate-500">Cuentas de acceso para técnicos y administradores</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium flex items-center"
        >
          + Nueva Cuenta
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="px-6 py-4 font-medium">Usuario</th>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Rol</th>
              <th className="px-6 py-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <UserCog className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No hay cuentas registradas.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{u.username}</td>
                  <td className="px-6 py-4 text-slate-600">{u.full_name || '—'}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ShieldCheck className="w-3.5 h-3.5" /> Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Wrench className="w-3.5 h-3.5" /> Técnico
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {me && me.id === u.id ? (
                      <span className="text-xs text-slate-400">tú</span>
                    ) : (
                      <button onClick={() => handleDelete(u)} className="text-red-400 hover:text-red-600 p-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Nueva Cuenta</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
                  {formError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                  <input required type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Usuario (para iniciar sesión)</label>
                  <input required type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.trim() })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Ej. jperez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <input required type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Mínimo 4 caracteres" minLength={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white">
                    <option value="technician">Técnico (usa la app móvil)</option>
                    <option value="admin">Administrador (usa el panel web)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 transition">
                  {saving ? 'Guardando…' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

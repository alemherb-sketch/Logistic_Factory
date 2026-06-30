import { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchTechnicians = () => {
    fetch(`${API_URL}/api/technicians`)
      .then(res => res.json())
      .then(data => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_URL}/api/technicians`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then((res) => {
      if(!res.ok) throw new Error('Network response was not ok');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchTechnicians();
    }).catch(err => {
      alert("Error de conexión: Asegúrate de que el servidor Backend (Python) esté en ejecución en el puerto 8000.");
      console.error(err);
    });
  };

  const handleDelete = (id: number) => {
    if(confirm('¿Seguro que deseas eliminar este técnico?')) {
      fetch(`${API_URL}/api/technicians/${id}`, { method: 'DELETE' })
        .then(() => fetchTechnicians());
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Técnicos</h2>
          <p className="text-slate-500">Gestión de personal técnico</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium flex items-center"
        >
          + Nuevo Técnico
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Teléfono</th>
              <th className="px-6 py-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No hay técnicos registrados.</p>
                </td>
              </tr>
            ) : (
              technicians.map((tech: any) => (
                <tr key={tech.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{tech.name}</td>
                  <td className="px-6 py-4 text-slate-600">{tech.email}</td>
                  <td className="px-6 py-4 text-slate-600">{tech.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(tech.id)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
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
              <h3 className="font-bold text-lg text-slate-800">Registrar Técnico</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="juan@correo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="+123456789" />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">Guardar Técnico</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

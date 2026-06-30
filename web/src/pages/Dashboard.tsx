import { useState, useEffect } from 'react';
import { FileText, Users, Search, MapPin, Trash2, X } from 'lucide-react';
import { apiFetch } from '../api';

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const fetchReports = () => {
    apiFetch('/api/reports')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (report: any) => {
    if (!confirm(`¿Eliminar el informe ${report.code || report.id}? Esta acción no se puede deshacer.`)) return;
    const res = await apiFetch(`/api/reports/${report.id}`, { method: 'DELETE' });
    if (res.ok) {
      setSelected(null);
      fetchReports();
    } else {
      alert('No se pudo eliminar el informe.');
    }
  };

  const openMap = (report: any) => {
    window.open(`https://www.google.com/maps?q=${report.latitude},${report.longitude}`, '_blank');
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? reports.filter((r) =>
        [r.code, r.plate, r.technician, r.vehicle, r.brand].some((v: any) =>
          (v || '').toString().toLowerCase().includes(q)
        )
      )
    : reports;

  const technicianCount = new Set(reports.map((r) => r.technician).filter(Boolean)).size;

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Resumen de Informes Técnicos Sincronizados</p>
        </div>

        <div className="glass px-4 py-2 rounded-full flex items-center shadow-sm bg-white border border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar informe o placa..."
            className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-4 bg-blue-50 rounded-xl mr-4">
            <FileText className="w-8 h-8 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Informes</p>
            <h3 className="text-2xl font-bold text-slate-800">{reports.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-4 bg-green-50 rounded-xl mr-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Técnicos Activos</p>
            <h3 className="text-2xl font-bold text-slate-800">{technicianCount}</h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800">Informes Recientes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Técnico</th>
                <th className="px-6 py-4 font-medium">Vehículo / Placa</th>
                <th className="px-6 py-4 font-medium">Estado Final</th>
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      Cargando datos...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    {reports.length === 0 ? 'No hay informes sincronizados aún.' : 'Sin resultados para tu búsqueda.'}
                  </td>
                </tr>
              ) : (
                filtered.map((report: any) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-brand-700">{report.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{report.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-800">{report.technician}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{report.vehicle}</p>
                      <p className="text-xs text-slate-500">{report.plate} - {report.brand}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {report.finalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelected(report)}
                          className="text-brand-600 hover:text-brand-800 p-2 rounded-lg hover:bg-brand-50 transition"
                          title="Ver detalles"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                        {report.latitude != null && report.longitude != null && (
                          <button
                            onClick={() => openMap(report)}
                            className="text-slate-400 hover:text-brand-600 p-2 rounded-lg hover:bg-slate-50 transition"
                            title="Ver en mapa"
                          >
                            <MapPin className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Eliminar informe"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{selected.code}</h3>
                <p className="text-xs text-slate-500">{selected.date} · {selected.technician}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vehículo" value={selected.vehicle} />
                <Field label="Placa" value={selected.plate} />
                <Field label="Marca" value={selected.brand} />
                <Field label="Estado Final" value={selected.finalStatus} />
              </div>
              <Field label="Falla encontrada" value={selected.issue} />
              <Field label="Acción realizada" value={selected.actionTaken} />
              <Field label="Repuestos utilizados" value={selected.partsUsed} />

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Ubicación GPS</p>
                {selected.latitude != null && selected.longitude != null ? (
                  <button
                    onClick={() => openMap(selected)}
                    className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)} — abrir en mapa
                  </button>
                ) : (
                  <p className="text-slate-400 text-sm">No disponible</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => handleDelete(selected)}
                className="inline-flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value || '—'}</p>
    </div>
  );
}

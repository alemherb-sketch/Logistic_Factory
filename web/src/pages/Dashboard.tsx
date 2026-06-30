import { useState, useEffect } from 'react';
import { FileText, Users, Search, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Fetch reports from FastAPI backend
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Resumen de Informes Técnicos Sincronizados</p>
        </div>
        
        <div className="glass px-4 py-2 rounded-full flex items-center shadow-sm">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
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
            <h3 className="text-2xl font-bold text-slate-800">12</h3>
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No hay informes sincronizados aún.
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
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
                    <td className="px-6 py-4 text-center">
                      <button className="text-brand-600 hover:text-brand-800 p-2 rounded-lg hover:bg-brand-50 transition" title="Ver Detalles">
                        <Search className="w-5 h-5" />
                      </button>
                      {report.latitude && (
                        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition" title="Ver en Mapa">
                          <MapPin className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import { Users } from 'lucide-react';

export default function Technicians() {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Técnicos</h2>
          <p className="text-slate-500">Gestión de personal técnico</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium flex items-center">
          + Nuevo Técnico
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-700 mb-2">Módulo en Construcción</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Aquí podrás registrar, editar y eliminar los datos de tus técnicos para asignarlos a los informes de mantenimiento.
        </p>
      </div>
    </div>
  );
}

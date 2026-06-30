import { Settings } from 'lucide-react';

export default function Parts() {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Repuestos</h2>
          <p className="text-slate-500">Catálogo e inventario de repuestos</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium flex items-center">
          + Nuevo Repuesto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-700 mb-2">Módulo en Construcción</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Aquí podrás gestionar tu inventario, registrar nuevos repuestos y verificar el stock disponible para mantenimientos.
        </p>
      </div>
    </div>
  );
}

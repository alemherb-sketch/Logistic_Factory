import { Truck, Users, FileText, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-brand-100" />
            <div>
              <h1 className="text-xl font-bold tracking-wider">LOGISTIC FACTORY</h1>
              <p className="text-xs text-brand-100 uppercase tracking-widest">Panel Administrativo</p>
            </div>
          </div>
          <nav className="flex space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-1 transition ${isActive ? 'text-brand-100 font-bold' : 'hover:text-brand-200'}`
              }
            >
              <FileText className="w-5 h-5"/> <span>Informes</span>
            </NavLink>
            <NavLink 
              to="/tecnicos" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-1 transition ${isActive ? 'text-brand-100 font-bold' : 'hover:text-brand-200'}`
              }
            >
              <Users className="w-5 h-5"/> <span>Técnicos</span>
            </NavLink>
            <NavLink 
              to="/repuestos" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-1 transition ${isActive ? 'text-brand-100 font-bold' : 'hover:text-brand-200'}`
              }
            >
              <Settings className="w-5 h-5"/> <span>Repuestos</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
}

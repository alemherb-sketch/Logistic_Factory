import { Truck, Users, FileText, Settings, UserCog, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../api';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-1 transition ${isActive ? 'text-brand-100 font-bold' : 'hover:text-brand-200'}`;

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

          <nav className="flex items-center space-x-6">
            <NavLink to="/" end className={linkClass}>
              <FileText className="w-5 h-5" /> <span>Informes</span>
            </NavLink>
            <NavLink to="/usuarios" className={linkClass}>
              <UserCog className="w-5 h-5" /> <span>Usuarios</span>
            </NavLink>
            <NavLink to="/tecnicos" className={linkClass}>
              <Users className="w-5 h-5" /> <span>Técnicos</span>
            </NavLink>
            <NavLink to="/repuestos" className={linkClass}>
              <Settings className="w-5 h-5" /> <span>Repuestos</span>
            </NavLink>

            <div className="flex items-center space-x-3 pl-6 border-l border-brand-500">
              <span className="text-sm text-brand-100 hidden sm:inline">
                {user?.full_name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center space-x-1 hover:text-brand-200 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
}

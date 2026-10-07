import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const DashboardView: React.FC = () => {
  const { user, logoutSession } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">MedAI Control Center</h1>
          <p className="text-sm text-slate-400">Panel de Control Clínico</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-slate-200">{user?.full_name}</p>
            <p className="text-xs text-slate-400">
              {user?.role} {user?.sub_role ? `(${user.sub_role})` : ''}
            </p>
          </div>
          <button
            onClick={logoutSession}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Pacientes Recientes</h2>
          <p className="text-3xl font-bold text-blue-400">12</p>
          <p className="text-xs text-slate-400 mt-2">Consultas programadas hoy</p>
        </div>

        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Módulos IA Activos</h2>
          <p className="text-3xl font-bold text-emerald-400">4</p>
          <p className="text-xs text-slate-400 mt-2">Modelos locales en ejecución</p>
        </div>

        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Estado del Sistema</h2>
          <p className="text-3xl font-bold text-teal-400">Óptimo</p>
          <p className="text-xs text-slate-400 mt-2">Conectado a FastAPI en 127.0.0.1:8000</p>
        </div>
      </main>
    </div>
  );
};
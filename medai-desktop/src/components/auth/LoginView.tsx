import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { loginSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referencia directa a la imagen sin import
  const logoPath = new URL('../../assets/images/MedAI.png', import.meta.url).href;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          throw new Error('Correo electrónico o contraseña incorrectos.');
        } else if (response.status === 422){
          throw new Error('Formato de credenciales inválido (422). Revisa el Backend espera "Username" o "email"');
        } else {
          throw new Error(`Error en el servidor de autenticación (${response.status}).`);
        }
      }

      const data = await response.json();
      
      loginSession({
        token: data.access_token,
        role: data.role || 'médico',
        sub_role: data.sub_role || 'general',
        full_name: data.full_name || 'Dr. Gabriel Vega',
      });
    } catch (err: any) {
      if (err.name === 'TypeError') {
        setError('No se pudo conectar con el backend en http://127.0.0.1:8000. Revisa CORS o si FastAPI está activo.');
      } else {
        setError(err.message || 'Error al iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Panel Izquierdo: Branding & Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 justify-center items-center p-8 border-r border-slate-800/60">
        {/* Luces de fondo (Glow) */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo con imagen directa */}
          <div className="mx-auto w-36 h-36 mb-6 rounded-3xl bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-emerald-400/20 p-1 shadow-2xl shadow-blue-500/10 flex items-center justify-center backdrop-blur-sm border border-white/10 overflow-hidden">
            <img 
              src={logoPath} 
              alt="MedAI Logo" 
              className="w-full h-full object-contain p-2"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent mb-2">
            MedAI Desktop
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Clinical Control Center — Plataforma de asistencia médica inteligente para la gestión clínica asistida localmente.
          </p>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-400">
              Ingresa tus credenciales del sistema médico.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@medai.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 rounded-xl font-semibold text-white shadow-lg shadow-blue-600/25 disabled:opacity-50 text-sm flex justify-center items-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                'Acceder al Control Center'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
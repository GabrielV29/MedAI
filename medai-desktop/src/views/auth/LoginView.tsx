import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export const LoginView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { loginSession } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            const data = await authService.login(email, password);
            loginSession({
                token: data.access_token,
                role: data.role,
                sub_role: data.sub_role,
                full_name: data.full_name,
            });
        }catch (err: any){
            if (err.response?.status === 401){
                setError('Correo o contraseña incorrectos.');
            } else {
                setError('Error de conexión con el servidor MedAI.');
            }
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-500">MedAI</h1>
                    <p className="mt-2 text-sm text-salte-400">Sistema de Control Clínico Asistido por IA</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Correo Electrónico</label>
                        <input type="email" required className="w-full px-4 py-2 mt-1 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="doctor@medai.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}>
                        </input>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                        <input type="password"
                        required
                        className="w-full px-4 py-2 mt-1 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        ></input>
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};
import React from 'react';
import { useGeoIPS } from '../../hooks/useGeoIPS';

interface IPSSelectorProps {
  onIPSSelect?: (ipsId: number | null) => void;
}

export const IPSSelector: React.FC<IPSSelectorProps> = ({ onIPSSelect }) => {
  const {
    departments,
    municipalities,
    ipsList,
    selectedDepartment,
    setSelectedDepartment,
    selectedMunicipality,
    setSelectedMunicipality,
    selectedIPS,
    setSelectedIPS,
    loading,
  } = useGeoIPS();

  const handleIPSChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedIPS(value);
    if (onIPSSelect) {
      onIPSSelect(value);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800 text-white rounded-xl border border-slate-700">
      <h3 className="text-lg font-semibold text-emerald-400">Ubicación e IPS de Atención</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de Departamento */}
        <div>
          <label className="block text-sm font-medium mb-1">Departamento</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Seleccione Departamento...</option>
            {departments.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Municipio */}
        <div>
          <label className="block text-sm font-medium mb-1">Municipio</label>
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            disabled={!selectedDepartment || loading}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          >
            <option value="">Seleccione Municipio...</option>
            {municipalities.map((muni) => (
              <option key={muni.code} value={muni.code}>
                {muni.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de IPS */}
        <div>
          <label className="block text-sm font-medium mb-1">Sede IPS</label>
          <select
            value={selectedIPS || ''}
            onChange={handleIPSChange}
            disabled={!selectedMunicipality || loading}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          >
            <option value="">Seleccione IPS...</option>
            {ipsList.map((ips) => (
              <option key={ips.id} value={ips.id}>
                {ips.nombre_prestador} - {ips.sede_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-xs text-emerald-400 animate-pulse">Cargando datos...</p>}
    </div>
  );
};
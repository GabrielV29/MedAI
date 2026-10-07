import { useState, useEffect } from 'react';

export interface Department {
  code: string;
  name: string;
}

export interface Municipality {
  code: string;
  name: string;
  department_code: string;
}

export interface IPS {
  id: number;
  id_prestador: string;
  nit: string;
  nombre_prestador: string;
  sede_name: string;
  address: string;
  phone: string;
  email: string;
  nivel_atencion: number;
  tipo_entidad: string;
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const useGeoIPS = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [ipsList, setIpsList] = useState<IPS[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedIPS, setSelectedIPS] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // 1. Cargar departamentos al iniciar
  useEffect(() => {
    fetch(`${API_BASE_URL}/geo/departments`)
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error('Error cargando departamentos:', err));
  }, []);

  // 2. Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (!selectedDepartment) {
      setMunicipalities([]);
      setSelectedMunicipality('');
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/geo/municipalities/${selectedDepartment}`)
      .then((res) => res.json())
      .then((data) => {
        setMunicipalities(data);
        setSelectedMunicipality('');
        setIpsList([]);
        setSelectedIPS(null);
      })
      .catch((err) => console.error('Error cargando municipios:', err))
      .finally(() => setLoading(false));
  }, [selectedDepartment]);

  // 3. Cargar IPS cuando cambia el municipio
  useEffect(() => {
    if (!selectedMunicipality) {
      setIpsList([]);
      setSelectedIPS(null);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/ips/by-municipality/${selectedMunicipality}`)
      .then((res) => res.json())
      .then((data) => {
        setIpsList(data);
        setSelectedIPS(null);
      })
      .catch((err) => console.error('Error cargando IPS:', err))
      .finally(() => setLoading(false));
  }, [selectedMunicipality]);

  return {
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
  };
};
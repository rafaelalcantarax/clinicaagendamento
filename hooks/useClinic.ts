
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ClinicConfig } from '../types';

export const useClinic = (slug: string = 'centro-vita') => {
  const [clinic, setClinic] = useState<ClinicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const data = await api.getClinicBySlug(slug);
        if (!data) throw new Error('Clínica não encontrada');
        setClinic(data);
      } catch (err: any) {
        console.error('Erro ao carregar clínica:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [slug]);

  return { clinic, loading, error };
};


export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Converte uma data para o fuso horário da clínica (ou local)
 * Útil para garantir que o "remarcação" ou "lembrete" use o horário correto.
 */
export const toClinicTZ = (date: string | Date, timezone: string = 'America/Sao_Paulo') => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
};

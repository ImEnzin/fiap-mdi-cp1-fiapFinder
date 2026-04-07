export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

export function calcularDiasRestantes(dataPrevista) {
  if (!dataPrevista) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prevista = new Date(dataPrevista + 'T00:00:00');
  prevista.setHours(0, 0, 0, 0);
  const diff = prevista.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function adicionarDias(dateStr, dias) {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function hoje() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

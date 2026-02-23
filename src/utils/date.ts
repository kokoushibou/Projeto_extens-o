export const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const nowIso = () => new Date().toISOString();

export const shiftDate = (date: string, delta: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
};

export const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

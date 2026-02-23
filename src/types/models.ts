export const APPOINTMENT_STATUS = ['MARCADO', 'CONCLUIDO', 'FALTOU', 'CANCELADO'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];

export type Client = {
  id: number;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: number;
  name: string;
  durationMin: number;
  defaultPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: number;
  date: string;
  startTime: string;
  durationMin: number;
  clientId: number;
  serviceId: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentWithRelations = Appointment & {
  clientName: string;
  serviceName: string;
};

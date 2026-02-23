import * as SQLite from 'expo-sqlite';
import { APPOINTMENT_STATUS, AppointmentStatus, AppointmentWithRelations, Client, Service } from '../types/models';
import { nowIso } from '../utils/date';

const db = SQLite.openDatabaseSync('agenda-salao.db');

type SqlValue = string | number | null;

const run = <T = any>(sql: string, params: SqlValue[] = []): T[] => {
  return db.getAllSync<T>(sql, params);
};

const exec = (sql: string, params: SqlValue[] = []) => {
  db.runSync(sql, params);
};

export const initDb = () => {
  db.execSync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      durationMin INTEGER NOT NULL,
      defaultPrice REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      durationMin INTEGER NOT NULL,
      clientId INTEGER NOT NULL,
      serviceId INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('MARCADO','CONCLUIDO','FALTOU','CANCELADO')),
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(clientId) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY(serviceId) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, startTime);
  `);
};

export const getClients = () => run<Client>('SELECT * FROM clients ORDER BY name');

export const saveClient = (payload: { id?: number; name: string; phone: string; notes?: string }) => {
  const timestamp = nowIso();
  if (payload.id) {
    exec('UPDATE clients SET name = ?, phone = ?, notes = ?, updatedAt = ? WHERE id = ?', [
      payload.name,
      payload.phone,
      payload.notes ?? '',
      timestamp,
      payload.id,
    ]);
    return payload.id;
  }

  exec('INSERT INTO clients(name, phone, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', [
    payload.name,
    payload.phone,
    payload.notes ?? '',
    timestamp,
    timestamp,
  ]);
  return db.getFirstSync<{ id: number }>('SELECT last_insert_rowid() as id')?.id;
};

export const deleteClient = (id: number) => exec('DELETE FROM clients WHERE id = ?', [id]);

export const getServices = () => run<Service>('SELECT * FROM services ORDER BY name');

export const saveService = (payload: {
  id?: number;
  name: string;
  durationMin: number;
  defaultPrice: number;
}) => {
  const timestamp = nowIso();
  if (payload.id) {
    exec(
      'UPDATE services SET name = ?, durationMin = ?, defaultPrice = ?, updatedAt = ? WHERE id = ?',
      [payload.name, payload.durationMin, payload.defaultPrice, timestamp, payload.id],
    );
    return payload.id;
  }

  exec('INSERT INTO services(name, durationMin, defaultPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', [
    payload.name,
    payload.durationMin,
    payload.defaultPrice,
    timestamp,
    timestamp,
  ]);
  return db.getFirstSync<{ id: number }>('SELECT last_insert_rowid() as id')?.id;
};

export const deleteService = (id: number) => exec('DELETE FROM services WHERE id = ?', [id]);

export const getAppointmentsByDate = (date: string) =>
  run<AppointmentWithRelations>(
    `SELECT a.*, c.name as clientName, s.name as serviceName
    FROM appointments a
    JOIN clients c ON c.id = a.clientId
    JOIN services s ON s.id = a.serviceId
    WHERE a.date = ?
    ORDER BY a.startTime ASC`,
    [date],
  );

export const getAppointmentsByClient = (clientId: number) =>
  run<AppointmentWithRelations>(
    `SELECT a.*, c.name as clientName, s.name as serviceName
    FROM appointments a
    JOIN clients c ON c.id = a.clientId
    JOIN services s ON s.id = a.serviceId
    WHERE a.clientId = ?
    ORDER BY a.date DESC, a.startTime DESC`,
    [clientId],
  );


export const getAppointmentById = (id: number) =>
  db.getFirstSync<any>('SELECT * FROM appointments WHERE id = ?', [id]);

export const hasTimeConflict = (date: string, startTime: string, excludeId?: number) => {
  const rows = run<{ total: number }>(
    'SELECT COUNT(*) as total FROM appointments WHERE date = ? AND startTime = ? AND (? IS NULL OR id != ?)',
    [date, startTime, excludeId ?? null, excludeId ?? null],
  );
  return (rows[0]?.total ?? 0) > 0;
};

export const saveAppointment = (payload: {
  id?: number;
  date: string;
  startTime: string;
  durationMin: number;
  clientId: number;
  serviceId: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
}) => {
  if (!APPOINTMENT_STATUS.includes(payload.status)) {
    throw new Error('Status inválido');
  }

  const timestamp = nowIso();
  if (payload.id) {
    exec(
      `UPDATE appointments
       SET date = ?, startTime = ?, durationMin = ?, clientId = ?, serviceId = ?, price = ?, status = ?, notes = ?, updatedAt = ?
       WHERE id = ?`,
      [
        payload.date,
        payload.startTime,
        payload.durationMin,
        payload.clientId,
        payload.serviceId,
        payload.price,
        payload.status,
        payload.notes ?? '',
        timestamp,
        payload.id,
      ],
    );
    return payload.id;
  }

  exec(
    `INSERT INTO appointments(date, startTime, durationMin, clientId, serviceId, price, status, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.date,
      payload.startTime,
      payload.durationMin,
      payload.clientId,
      payload.serviceId,
      payload.price,
      payload.status,
      payload.notes ?? '',
      timestamp,
      timestamp,
    ],
  );
  return db.getFirstSync<{ id: number }>('SELECT last_insert_rowid() as id')?.id;
};

export const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
  if (!APPOINTMENT_STATUS.includes(status)) {
    throw new Error('Status inválido');
  }
  exec('UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ?', [status, nowIso(), id]);
};

export const deleteAppointment = (id: number) => exec('DELETE FROM appointments WHERE id = ?', [id]);

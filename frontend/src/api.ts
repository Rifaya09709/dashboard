import axios from 'axios';

const API_BASE = 'https://dashboard-cafm-flydubai.onrender.com/api';
const api = axios.create({ baseURL: API_BASE });

export interface WorkOrder {
  _id: string;
  title: string;
  category: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  location: string;
  description: string;
  month: string;
  createdAt: string;
  closedAt?: string;
}

export interface MonthlyStatEntry {
  month: string;
  year: number;
  generated: number;
  closed: number;
  categories: Record<string, number>;
}

export interface StatsResponse {
  summary: { totalGenerated: number; totalClosed: number; efficiencyRate: number };
  monthly: MonthlyStatEntry[];
}

// Stats API
export const fetchStats = () =>
  api.get<{ success: boolean; data: StatsResponse }>('/stats').then(r => r.data.data);

// Work Orders API
export const fetchWorkOrders = (params?: Record<string, string | number>) =>
  api.get<{ success: boolean; data: WorkOrder[]; total: number }>('/workorders', { params }).then(r => r.data);

export const createWorkOrder = (data: Partial<WorkOrder>) =>
  api.post<{ success: boolean; data: WorkOrder }>('/workorders', data).then(r => r.data.data);

export const updateWorkOrder = (id: string, data: Partial<WorkOrder>) =>
  api.put<{ success: boolean; data: WorkOrder }>(`/workorders/${id}`, data).then(r => r.data.data);

export const deleteWorkOrder = (id: string) =>
  api.delete(`/workorders/${id}`).then(r => r.data);
import { api } from './instance';
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus } from './types';

const API_URL = '/tasks';

export const tasksApi = {
  getTasks: async (projectId: number, status?: TaskStatus): Promise<Task[]> => {
    const params: any = { project_id: projectId };
    if (status) params.status = status;

    const response = await api.get<Task[]>(`${API_URL}/`, { params });
    return response.data;
  },

  createTask: async (data: TaskCreateData): Promise<Task> => {
    const response = await api.post<Task>(`${API_URL}/`, data);
    return response.data;
  },

  updateTask: async (taskId: number, data: TaskUpdateData): Promise<Task> => {
    const response = await api.put<Task>(`${API_URL}/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`${API_URL}/${taskId}`);
  },
};
import { api } from './instance';
import type { ProjectCreate, ProjectResponse, ProjectUpdate } from './types';

export const projectsApi = {
  getProjects: async (): Promise<ProjectResponse[]> => {
    const response = await api.get<ProjectResponse[]>('/projects');
    return response.data;
  },

  createProject: async (data: ProjectCreate): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data;
  },

  updateProject: async (projectId: number, data: ProjectUpdate): Promise<ProjectResponse> => {
    const response = await api.put<ProjectResponse>(`/projects/${projectId}`, data);
    return response.data;
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
};
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
}

export interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  owner_id: number;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'testing' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  project_id: number;
  status?: TaskStatus;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
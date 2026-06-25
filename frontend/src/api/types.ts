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
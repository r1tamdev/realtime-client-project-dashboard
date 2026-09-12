export interface Client {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  managerId: string;
  createdAt: string;
  client?: Client;
}
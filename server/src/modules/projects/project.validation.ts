import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  clientId: z.string().uuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
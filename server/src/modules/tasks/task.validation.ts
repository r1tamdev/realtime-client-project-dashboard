import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(1).max(2000),
  assigneeId: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'dueDate must be a valid date string',
  }),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
});

export const taskFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
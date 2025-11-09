import type { Task, Status } from '../types/task';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/tasks';

// Type definition for creating a new task
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: Status;
}

// Type definition for updating an existing task
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: Status;
  dueDate?: string; // ISO date string
}

// Handle json response errors
async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json() as Promise<T>;
}

export interface TaskStats {
  total: number;
  byStatus: Record<Status, number>;
  percentCompleted: number;
}

// GET /tasks?status=status - fetch all tasks, optionally filtered by status
export const fetchTasks = async (status?: Status): Promise<Task[]> => {
  const url = status ? `${API_URL}?status=${status}` : API_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

// POST /tasks - create a new task
export const createTask = async (taskData: CreateTaskDto): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return parseJsonResponse<Task>(response);
};

// PUT /tasks - update a task
export const updateTask = async (taskId: string, taskData: UpdateTaskDto): Promise<Task> => {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return parseJsonResponse<Task>(response);
};

// DELETE /tasks/:id - delete a task
export const deleteTask = async (taskId: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: 'DELETE',
  });
  return parseJsonResponse<Task>(response);
};

// GET /tasks/stats - fetch task statistics
export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await fetch(`${API_URL}/get-stats`);
  console.log('Response:', response);

  if (!response.ok) {
    throw new Error('Failed to fetch task statistics');
  }
  return parseJsonResponse<TaskStats>(response);
};

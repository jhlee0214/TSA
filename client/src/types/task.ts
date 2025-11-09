// Definition of Task type used in the client application
export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  createdAt: Date;
  updatedAt: Date;
}

// Definition of Status type used in the client application
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
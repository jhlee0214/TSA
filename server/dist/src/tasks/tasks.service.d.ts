import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '@prisma/client';
export interface TaskStats {
    total: number;
    byStatus: Record<Status, number>;
    percentCompleted: number;
}
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTask(createTaskDto: CreateTaskDto): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAllTasks(status?: Status): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null>;
    update(id: number, updateTaskDto: UpdateTaskDto): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    countTasksByStatus(): Promise<Record<Status, number>>;
    getStats(): Promise<TaskStats>;
}

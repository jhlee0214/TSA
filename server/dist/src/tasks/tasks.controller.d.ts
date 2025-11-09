import { TasksService, TaskStats } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';
import { Status } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAllTasks(status?: Status): Promise<{
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    createTask(createTaskDto: CreateTaskDto): Promise<Task>;
    updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task>;
    deleteTask(id: number): Promise<Task>;
    getStats(): Promise<TaskStats>;
}

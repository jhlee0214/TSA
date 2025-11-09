import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '@prisma/client';

// Interface for Task Statistics
export interface TaskStats {
  total: number;
  byStatus: Record<Status, number>;
  percentCompleted: number;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskDto) {
    Logger.log('Creating a new task...', 'TasksService');
    return this.prisma.task.create({ data: createTaskDto });
  }

  async findAllTasks(status?: Status) {
    return this.prisma.task.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    Logger.log(`Updating task with id ${id}...`, 'TasksService');

    // Ensure the task exists before updating
    if (!(await this.findOne(id))) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    Logger.log(`Deleting task with id ${id}...`, 'TasksService');

    // Ensure the task exists before deleting
    if (!(await this.findOne(id))) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.prisma.task.delete({ where: { id } });
  }

  // Count tasks by status to be called by TaskStats endpoint
  async countTasksByStatus(): Promise<Record<Status, number>> {
    const result = Object.values(Status).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<Status, number>,
    );

    await Promise.all(
      Object.values(Status).map(async (status) => {
        result[status] = await this.prisma.task.count({ where: { status } });
      }),
    );

    return result;
  }

  async getStats(): Promise<TaskStats> {
    const byStatus = await this.countTasksByStatus();
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    const percentCompleted = total
      ? Number(((byStatus[Status.COMPLETED] / total) * 100).toFixed(2))
      : 0;

    return { total, byStatus, percentCompleted };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '@prisma/client';

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

  // calculate the percentage of completed tasks
  async calculateCompletionPercentage(): Promise<number> {
    const totalTasks = await this.prisma.task.count();
    if (totalTasks === 0) {
      return 0;
    }
    const completedTasks = await this.prisma.task.count({
      where: { status: Status.COMPLETED },
    });
    return (completedTasks / totalTasks) * 100;
  }

  // Count tasks by status
  async countTasksByStatus(): Promise<Record<Status, number>> {
    const statuses = Object.values(Status);
    const counts: Record<Status, number> = {} as Record<Status, number>;

    for (const status of statuses) {
      counts[status] = await this.prisma.task.count({
        where: { status },
      });
    }

    return counts;
  }
}

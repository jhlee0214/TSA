import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskDto) {
    Logger.log('Creating a new task...', 'TasksService');
    return this.prisma.task.create({ data: createTaskDto });
  }

  async findAllTasks() {
    return this.prisma.task.findMany();
  }

  async findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    Logger.log(`Updating task with id ${id}...`, 'TasksService');
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}

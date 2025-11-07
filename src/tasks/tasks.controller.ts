import {
  Body,
  Controller,
  Delete,
  Param,
  Get,
  Post,
  Logger,
  ParseIntPipe,
  Put,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';
import { Status } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get() findAllTasks(
    @Query('status', new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
  ) {
    return this.tasksService.findAllTasks(status);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  @Put(':id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    Logger.log(`Replacing task with id ${id}...`, 'TasksController');
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.remove(id);
  }

  @Get('completed-percentage')
  async getCompletedTasksPercentage(): Promise<{ percentage: number }> {
    const percentage = await this.tasksService.calculateCompletionPercentage();
    return { percentage };
  }

  // Get counted each status
  @Get('status-count')
  async getStatusCount(): Promise<Record<Status, number>> {
    return this.tasksService.countTasksByStatus();
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTask(createTaskDto) {
        common_1.Logger.log('Creating a new task...', 'TasksService');
        return this.prisma.task.create({ data: createTaskDto });
    }
    async findAllTasks(status) {
        return this.prisma.task.findMany({
            where: { status },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, updateTaskDto) {
        common_1.Logger.log(`Updating task with id ${id}...`, 'TasksService');
        try {
            return await this.prisma.task.update({
                where: { id },
                data: updateTaskDto,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Task with id ${id} not found`);
            }
            throw error;
        }
    }
    async remove(id) {
        common_1.Logger.log(`Deleting task with id ${id}...`, 'TasksService');
        try {
            return await this.prisma.task.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Task with id ${id} not found`);
            }
            throw error;
        }
    }
    async countTasksByStatus() {
        const result = Object.values(client_1.Status).reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
        const grouped = await this.prisma.task.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        grouped.forEach(({ status, _count }) => {
            result[status] = _count.status;
        });
        return result;
    }
    async getStats() {
        const byStatus = await this.countTasksByStatus();
        const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
        const percentCompleted = total
            ? Number(((byStatus[client_1.Status.COMPLETED] / total) * 100).toFixed(2))
            : 0;
        return { total, byStatus, percentCompleted };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
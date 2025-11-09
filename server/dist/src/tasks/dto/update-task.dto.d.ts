import { Status } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: Status;
    dueDate?: Date;
}

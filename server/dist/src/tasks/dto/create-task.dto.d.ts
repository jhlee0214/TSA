import { Status } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: Status;
    createdAt?: Date;
}

import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsDate()
  dueDate?: Date;
}

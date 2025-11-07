import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { Status } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsDate()
  @IsOptional()
  createdAt?: Date;
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('api/health/db')
  async dbHealth() {
    const rows = await this.prismaService.$queryRaw<
      { result: bigint }[]
    >`SELECT 1 as result`;
    return {
      status: 'ok',
      result: rows.map((r) => ({ result: r.result.toString() })),
    };
  }
}

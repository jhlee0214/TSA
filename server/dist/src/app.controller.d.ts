import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prismaService;
    constructor(appService: AppService, prismaService: PrismaService);
    dbHealth(): Promise<{
        status: string;
        result: {
            result: string;
        }[];
    }>;
}

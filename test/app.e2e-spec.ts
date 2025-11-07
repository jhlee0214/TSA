import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Status, Task } from '@prisma/client';

describe('Tasks E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    // Clean DB before each test
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /tasks - creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write README', description: 'Add project docs' })
      .expect(201);

    const body: Task = res.body;
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Write README');
    expect(body.description).toBe('Add project docs');
    expect(body.status).toBe(Status.NOT_STARTED);
  });

  it('POST /tasks - 400 on invalid payload (missing title)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ description: 'Missing title' })
      .expect(400);
  });

  it('GET /tasks - returns created tasks', async () => {
    await prisma.task.create({ data: { title: 'T1', description: 'D1' } });
    await prisma.task.create({
      data: { title: 'T2', description: 'D2', status: Status.IN_PROGRESS },
    });

    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    const list: Task[] = res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(2);
    const titles = list.map((t) => t.title).sort();
    expect(titles).toEqual(['T1', 'T2']);
  });

  it('PATCH /tasks/:id - updates a task', async () => {
    const created = await prisma.task.create({ data: { title: 'To Update' } });

    const res = await request(app.getHttpServer())
      .patch(`/tasks/${created.id}`)
      .send({ status: Status.COMPLETED, title: 'Updated Title' })
      .expect(200);

    const updated: Task = res.body;
    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe('Updated Title');
    expect(updated.status).toBe(Status.COMPLETED);
  });

  it('DELETE /tasks/:id - removes a task', async () => {
    const created = await prisma.task.create({ data: { title: 'To Delete' } });

    await request(app.getHttpServer())
      .delete(`/tasks/${created.id}`)
      .expect(200);

    const count = await prisma.task.count();
    expect(count).toBe(0);
  });
});

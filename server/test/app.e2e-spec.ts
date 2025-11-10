import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
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

  afterEach(async () => {
    // Log each test completion with remaining tasks
    const state = (expect as any).getState?.() as { currentTestName?: string };
    const count = await prisma.task.count();
    Logger.log(
      `Finished: ${state?.currentTestName ?? 'unknown'} | tasks in DB: ${count}`,
      'Tasks E2E',
    );
  });

  afterAll(async () => {
    // Seed realistic tasks after the suite for manual QA previews
    const seedTasks: { title: string; description: string; status: Status }[] =
      [
        {
          title: 'Prepare Sprint Demo',
          description: 'Compile metrics and slides for TSA stakeholders.',
          status: Status.IN_PROGRESS,
        },
        {
          title: 'Update Knowledge Base',
          description: 'Document the latest deployment checklist.',
          status: Status.NOT_STARTED,
        },
        {
          title: 'Recruitment Follow-up',
          description: 'Email shortlisted candidates about second interviews.',
          status: Status.COMPLETED,
        },
        {
          title: 'Client Health Check',
          description: 'Review contact center SLA for Q2.',
          status: Status.IN_PROGRESS,
        },
        {
          title: 'CSR Training Pack',
          description: 'Refresh scripts with TSA Orange branding.',
          status: Status.NOT_STARTED,
        },
        {
          title: 'Finance Reconciliation',
          description: 'Cross-check vendor invoices prior to payment run.',
          status: Status.COMPLETED,
        },
        {
          title: 'Voice of Customer Highlights',
          description: 'Summarize top trends from the latest survey.',
          status: Status.NOT_STARTED,
        },
        {
          title: 'Security Patch Rollout',
          description: 'Schedule overnight hotfix deployment.',
          status: Status.IN_PROGRESS,
        },
        {
          title: 'Quarterly Business Review Prep',
          description: 'Align agenda with enterprise accounts team.',
          status: Status.COMPLETED,
        },
        {
          title: 'People & Culture Newsletter',
          description: 'Draft August edition with TSA Pink theme.',
          status: Status.NOT_STARTED,
        },
        {
          title: 'CX Automation POC',
          description: 'Pilot intent routing for digital queue.',
          status: Status.IN_PROGRESS,
        },
        {
          title: 'Service Desk Retro',
          description: 'Capture wins + learnings from last incident.',
          status: Status.COMPLETED,
        },
      ];

    await prisma.task.createMany({
      data: seedTasks,
    });

    await app.close();
  });

  // Ensures a task can be created successfully
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

  // Validates request body must include required fields
  it('POST /tasks - 400 on invalid payload (missing title)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ description: 'Missing title' })
      .expect(400);
  });

  // Fetches all tasks without filters
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

  // Updates an existing task with valid payload
  it('PUT /tasks/:id - updates a task', async () => {
    const created = await prisma.task.create({ data: { title: 'To Update' } });

    const res = await request(app.getHttpServer())
      .put(`/tasks/${created.id}`)
      .send({ status: Status.COMPLETED, title: 'Updated Title' })
      .expect(200);

    const updated: Task = res.body;
    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe('Updated Title');
    expect(updated.status).toBe(Status.COMPLETED);
  });

  // Ensures invalid path parameter triggers validation error
  it('PUT /tasks/invalidID - 400 on invalid id number', async () => {
    await request(app.getHttpServer())
      .put(`/tasks/invalidID`)
      .send({ status: Status.COMPLETED, title: 'Updated Title' })
      .expect(400);
  });

  // Deletes an existing task by numeric id
  it('DELETE /tasks/:id - removes a task', async () => {
    const created = await prisma.task.create({ data: { title: 'To Delete' } });

    await request(app.getHttpServer())
      .delete(`/tasks/${created.id}`)
      .expect(200);

    const count = await prisma.task.count();
    expect(count).toBe(0);
  });

  // Ensures invalid id format results in 400 Bad Request
  it('DELETE /tasks/invalidID - 400 on invalid id number', async () => {
    await request(app.getHttpServer()).delete('/tasks/invalidID').expect(400);
  });

  // Filters tasks by status query parameter
  it('GET /tasks?status=IN_PROGRESS - filters by status', async () => {
    await prisma.task.createMany({
      data: [
        { title: 'T1', description: 'Foo', status: Status.NOT_STARTED },
        { title: 'T2', description: 'Bar', status: Status.IN_PROGRESS },
        { title: 'T3', description: 'Baz', status: Status.IN_PROGRESS },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/tasks')
      .query({ status: Status.IN_PROGRESS })
      .expect(200);

    expect(res.body).toHaveLength(2);
    res.body.forEach((task: Task) =>
      expect(task.status).toBe(Status.IN_PROGRESS),
    );
  });

  // Fetches aggregated stats (totals + completion percentage)
  it('GET /tasks/get-stats - returns totals and completion percentage', async () => {
    await prisma.task.createMany({
      data: [
        { title: 'Alpha', status: Status.NOT_STARTED },
        { title: 'Beta', status: Status.COMPLETED },
        { title: 'Gamma', status: Status.COMPLETED },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/tasks/get-stats')
      .expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.byStatus.NOT_STARTED).toBe(1);
    expect(res.body.byStatus.COMPLETED).toBe(2);
    expect(res.body.percentCompleted).toBe(66.67);
  });

  // Update request should return 404 when task id is not found
  it('PUT /tasks/:id - 404 when task does not exist', async () => {
    await request(app.getHttpServer())
      .put('/tasks/999999')
      .send({ title: 'Ghost', status: Status.COMPLETED })
      .expect(404);
  });

  // Delete request should return 404 when task id is not found
  it('DELETE /tasks/:id - 404 when task does not exist', async () => {
    await request(app.getHttpServer()).delete('/tasks/999999').expect(404);
  });
});

# TSA Skills Assessment – To Do App

Full stack implementation for the TSA skills assessment.  
Backend is a NestJS REST API with Prisma and SQLite.  
Frontend is a React app built with Vite and TypeScript, styled using a TSA inspired color system.

> Note on branding  
> Official TSA logos and downloadable brand assets were not publicly available at build time, so no logo files are included.  
> Instead, the UI uses TSA key color accents for a clean and respectful brand alignment.  
> If official approval and files are provided, I will add the logo to the header and favicon in a follow up commit.

## What this README covers

1 Project layout  
2 Local setup and environment variables  
3 How to run server and client  
4 REST API and sample requests  
5 Validation and basic error handling  
6 Frontend features including completion stats  
7 Technology choices and why they fit this task  
8 Known limitations and planned improvements  
9 Submission checklist

## Project layout

```
├── client        React Vite frontend TypeScript
├── server        NestJS backend Prisma SQLite
└── package.json  root placeholder each workspace manages its own deps
```

## Quick start

Prerequisites  
* Node.js version 20 or newer  
* npm version 10 or newer

Environment variables

Server (`server/.env`)  
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

Client (`client/.env`)  
```
VITE_API_BASE_URL=http://localhost:3000/tasks
```

Run the server  
```
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Run the client  
```
cd client
npm install
npm run dev
```

Vite Dev server URL
```
http://localhost:5173
```

Inspect or edit data visually  
```
cd server
npx prisma studio
```

## REST API

Base URL  
```
http://localhost:3000/tasks
```

Endpoints

| Method | Path         | Description                                                     |
|--------|--------------|-----------------------------------------------------------------|
| GET    | /tasks       | List tasks (optional `status` query)                            |
| POST   | /tasks       | Create task (`title` required, `description`/`status` optional) |
| PUT    | /tasks/:id   | Update task (partial payloads allowed)                          |
| DELETE | /tasks/:id   | Delete task                                                     |
| GET    | /tasks/stats | Status counts and completion percentage                         |


Samples

List tasks  
```
GET /tasks
```
Response  
```json
[
  {
    "id": 1,
    "title": "Write README",
    "description": "setup and usage",
    "status": "IN_PROGRESS",
    "createdAt": "2025-11-07T01:23:45.000Z",
    "updatedAt": "2025-11-07T01:23:45.000Z"
  }
]
```

Create task  
```
POST /api/tasks
Content-Type: application/json
```
Body  
```json
{ "title": "First task", "description": "optional", "status": "NOT_STARTED" }
```
Response  
```json
{
  "id": 2,
  "title": "First task",
  "description": "optional",
  "status": "NOT_STARTED",
  "createdAt": "2025-11-07T01:30:00.000Z",
  "updatedAt": "2025-11-07T01:30:00.000Z"
}
```

Update task  
```
PUT /api/tasks/2
Content-Type: application/json
```
Body  
```json
{ "status": "COMPLETED" }
```

Delete task  
```
DELETE /api/tasks/2
```
Response  
```json
{ "ok": true }
```

Stats  
```
GET /api/tasks/stats
```
Response  
```json
{
  "total": 10,
  "byStatus": { "NOT_STARTED": 4, "IN_PROGRESS": 3, "COMPLETED": 3 },
  "completedRate": 30.0
}
```


## Validation and error handling

Input validation  
* DTOs with class validator  
* title is a string with minimum length of 1  
* description is optional string  
* status is an optional enum value among NOT_STARTED IN_PROGRESS COMPLETED

Global validation pipe  
* whitelist true removes unknown fields  
* forbidNonWhitelisted true returns 400 when unknown fields are present  
* transform true converts primitive values into DTO types

Error handling  
* Updating or deleting a non existing id returns 404 NotFoundException  
* Prisma error P2025 is mapped to 404  
* Validation failures return 400 Bad Request

## Frontend features

* Task list table with id title description status  
* Inline status badge plus edit and delete actions  
* Status filter and optional text search  
* Modal edit form with Escape key to close  
* Completion indicator using a progress bar and percentage fed by the stats endpoint  
* Basic accessibility for the progress bar via aria attributes

Build for production  
```
cd client
npm run build
npm run preview
```

## Technology choices and why they fit

NestJS  
* Clear module structure and dependency injection improve maintainability  
* Easy to test and extend with standard patterns

TypeScript  
* Static types reduce runtime bugs  
* DTO typing and service method signatures clarify the API contract

Prisma ORM  
* Schema driven development with straightforward migrations  
* Type safe client reduces query mistakes

SQLite  
* Runs with zero external dependencies  
* Very reproducible in reviewer environments  
* Easy to swap to PostgreSQL for production by changing provider and DATABASE_URL then running migrate deploy

React with Vite  
* Fast dev server and simple bundling  
* Component driven UI that maps well to the feature list

## Known limitations and planned improvements

Limitations  
* No authentication or authorization yet  
* Pagination and advanced sorting are minimal  
* Error response format is intentionally simple

Planned improvements  
* Add Kanban view as an alternative to the table  
* Add pagination and richer sorting  
* Generate OpenAPI docs and include Swagger UI  
* Set up CI and container templates for both workspaces  
* Expand unit tests and frontend tests

## Branding and licensing notes

Logo  
* The official TSA logo is not bundled due to licensing and lack of a public download source at build time  
* I will include it once official approval and files are available

Colors  
* The UI uses TSA inspired key color accents, for example `#e41072` for the header and primary accents  
* With official brand guidelines I will revisit contrast ratios and state color ramp

Fonts  
* Gilroy is not entirely free, so the repository does not ship font files  
* The app falls back to system fonts or an open alternative such as Inter or Manrope  
* If a licensed webfont is provided, I will register it via `@font-face` and use it for headings

## Tests

Backend e2e tests  
```
cd server
npm run test:e2e
```
Additional unit tests and frontend tests can be added as needed.

## Submission checklist

1 Server runs locally on port 4000 with prefix `/api`  
2 Client runs locally and points to `VITE_API_BASE_URL`  
3 README matches the assessment brief and includes setup instructions  
4 Source code is ready to zip or share via a repository link

---

For TSA reviewers  
Start the backend first, then the frontend.  
The UI will fetch the task list, allow create update delete, and show completion stats from the API.  
If needed, inspect `server/prisma/dev.db` using Prisma Studio.

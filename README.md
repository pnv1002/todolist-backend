# TodoList Backend

REST API cho ứng dụng quản lý công việc (TodoList), xây dựng bằng **Node.js + Express + TypeScript + PostgreSQL**.

## Tech Stack

| Công nghệ | Vai trò |
|---|---|
| Node.js + Express | HTTP server, routing |
| TypeScript | Type-safe codebase |
| PostgreSQL + `pg` | Database |
| JWT (Access + Refresh Token) | Xác thực người dùng |
| Zod | Validation dữ liệu đầu vào |
| bcryptjs | Hash mật khẩu |
| Swagger UI | Tài liệu API tương tác (dev only) |
| `tsx` | Hot-reload khi development |
| `cross-env` | Set `NODE_ENV` đa nền tảng |

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Load .env theo NODE_ENV, export env object
│   ├── controllers/
│   │   ├── authController.ts   # Register, Login, Refresh, Logout
│   │   └── todoController.ts   # CRUD todos
│   ├── db/
│   │   └── index.ts            # Khởi tạo pool PG và bảng dữ liệu
│   ├── middlewares/
│   │   ├── authMiddleware.ts   # Xác thực JWT từ header
│   │   └── errorMiddleware.ts  # Global error handler
│   ├── routes/
│   │   ├── authRoutes.ts       # /api/auth/*
│   │   └── todoRoutes.ts       # /api/todos/*
│   ├── services/
│   │   ├── authService.ts      # Logic xác thực, quản lý refresh token
│   │   └── todoService.ts      # Logic CRUD todos
│   ├── utils/
│   │   ├── AppError.ts         # Custom error class
│   │   └── jwt.ts              # Sign / verify JWT
│   ├── swagger.ts              # Cấu hình Swagger spec
│   ├── app.ts                  # Express app (middleware, routes)
│   └── server.ts               # Entry point
├── .env.development            # Config môi trường dev (không commit)
├── .env.production             # Config môi trường prod (không commit)
├── .env.example                # Template — copy để tạo env file
├── .gitignore
├── package.json
└── tsconfig.json
```

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/register` | Đăng ký tài khoản | Không |
| POST | `/login` | Đăng nhập, trả về access + refresh token | Không |
| POST | `/refresh` | Làm mới access token | Không |
| POST | `/logout` | Đăng xuất, xóa refresh token | Không |

### Todos — `/api/todos`

> Tất cả endpoint yêu cầu header `Authorization: Bearer <accessToken>`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách todos của user |
| POST | `/` | Tạo todo mới |
| GET | `/:id` | Lấy chi tiết một todo |
| PUT | `/:id` | Cập nhật todo |
| DELETE | `/:id` | Xóa todo |

## Database Schema

```sql
users (id, name, email, password, created_at)
refresh_tokens (id, user_id, token, expires_at, created_at)
todos (id, user_id, title, description, status, priority, deadline, created_at, updated_at)
```

- `status`: `pending` | `in_progress` | `done`
- `priority`: `low` | `medium` | `high`

## Cài đặt & Chạy

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file env

```bash
cp .env.example .env.development
```

Chỉnh sửa `.env.development`:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Chạy development

```bash
npm run dev
```

Server khởi động tại `http://localhost:3001`, tự động reload khi có thay đổi.

### 4. Build & chạy production

```bash
npm run build       # Compile TypeScript → dist/
npm run start       # Chạy dist/server.js với NODE_ENV=production
```

## Scripts

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `npm run dev` | `cross-env NODE_ENV=development tsx watch src/server.ts` | Dev với hot-reload |
| `npm run build` | `cross-env NODE_ENV=production tsc` | Compile TypeScript |
| `npm run start` | `cross-env NODE_ENV=production node dist/server.js` | Chạy production |
| `npm run start:dev` | `cross-env NODE_ENV=development node dist/server.js` | Chạy bản build ở dev mode |

## Môi trường

| File | Môi trường | Commit? |
|------|-----------|---------|
| `.env.development` | Development | Không |
| `.env.production` | Production | Không |
| `.env.example` | Template | **Có** |

Env được load tự động theo `NODE_ENV` từ `src/config/env.ts`.

## Swagger UI

Chỉ khả dụng ở môi trường **development**:

- UI: `http://localhost:3001/api-docs`
- JSON spec: `http://localhost:3001/api-docs.json`

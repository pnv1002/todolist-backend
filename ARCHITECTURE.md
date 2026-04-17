# Kiến trúc tổng thể — TodoList Project

## Mục lục
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Infrastructure & Deployment](#2-infrastructure--deployment)
3. [Backend — Luồng xử lý request](#3-backend--luồng-xử-lý-request)
4. [Database Schema](#4-database-schema)
5. [Luồng xác thực (Auth Flow)](#5-luồng-xác-thực-auth-flow)
6. [Frontend — Kiến trúc & Data Flow](#6-frontend--kiến-trúc--data-flow)
7. [Giao tiếp Frontend ↔ Backend](#7-giao-tiếp-frontend--backend)
8. [Tính năng đặc biệt](#8-tính-năng-đặc-biệt)

---

## 1. Tổng quan hệ thống

```mermaid
graph TB
    subgraph Client["Client Layer (Browser)"]
        FE["Frontend\nReact 18 + TypeScript\nVite / localhost:5173"]
    end

    subgraph Server["Server Layer"]
        BE["Backend\nNode.js + Express.js\nTypeScript / localhost:3001"]
        UPL["/uploads\nFile Storage"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL 16\nDocker / port 5433")]
    end

    FE -- "REST API (HTTP/JSON)\nAuthorization: Bearer JWT" --> BE
    BE -- "SQL (pg pool)" --> PG
    BE -- "Read/Write files" --> UPL
    FE -- "File download URL" --> UPL

    style Client fill:#dbeafe,stroke:#3b82f6
    style Server fill:#dcfce7,stroke:#16a34a
    style Data fill:#fef9c3,stroke:#ca8a04
```

---

## 2. Infrastructure & Deployment

```mermaid
graph LR
    subgraph Docker["Docker Compose"]
        PG[("postgres:16\ncontainer: postgres_db\nport 5433:5432\nvolume: pgdata")]
    end

    subgraph Local["Local Development"]
        FE["Frontend\nnpm run dev\nVite HMR\n:5173"]
        BE["Backend\nnpm run dev\ntsx watch\n:3001"]
    end

    BE -- "DATABASE_URL\npostgres://postgres:postgres\n@localhost:5433/mydb" --> PG
    FE -- "VITE_API_URL\nhttp://localhost:3001" --> BE

    subgraph EnvFiles["Environment Files"]
        E1[".env.development"]
        E2[".env.production"]
        E3[".env.example (template)"]
    end

    BE -. "load by NODE_ENV" .-> EnvFiles

    style Docker fill:#f0f9ff,stroke:#0ea5e9
    style Local fill:#f0fdf4,stroke:#22c55e
```

---

## 3. Backend — Luồng xử lý request

```mermaid
flowchart TD
    REQ([HTTP Request\ntừ Frontend]) --> CORS

    subgraph Middleware["Middleware Chain (app.ts)"]
        CORS["cors()\nChỉ cho phép FRONTEND_URL"]
        JSON["express.json()\nParse body"]
        COOKIE["cookieParser()"]
        GLIMIT["globalLimiter\n100 req / 15 phút"]
        ALIMIT["authLimiter\n10 req / 15 phút\n(chỉ /api/auth)"]
        AUTH["authenticate()\nVerify JWT Bearer Token\n→ gán req.user"]
    end

    CORS --> JSON --> COOKIE --> GLIMIT --> ALIMIT

    ALIMIT --> Routes

    subgraph Routes["Route Layer"]
        R1["/api/auth\nPublic"]
        R2["/api/todos\nProtected"]
        R3["/api/tags\nProtected"]
    end

    R2 --> AUTH
    R3 --> AUTH

    AUTH --> Controllers

    subgraph Controllers["Controller Layer"]
        C1["authController\nValidate Zod → gọi Service"]
        C2["todoController\nValidate Zod → gọi Service"]
        C3["tagController\nValidate Zod → gọi Service"]
    end

    Controllers --> Services

    subgraph Services["Service Layer (Business Logic)"]
        S1["authService\nbcrypt, JWT, refresh token"]
        S2["todoService\nCRUD, pagination, position"]
        S3["attachmentService\nMulter, file CRUD"]
        S4["tagService\nCRUD, many-to-many"]
    end

    Services --> DB[("PostgreSQL\npg pool")]
    S3 --> FS["File System\n/uploads"]

    DB --> RES([HTTP Response\nJSON])
    FS --> RES

    subgraph ErrorHandling["Error Handler (global)"]
        ERR["errorMiddleware\nAppError → HTTP status\nZod Error → 400\nOther → 500"]
    end

    Controllers -. "throw AppError" .-> ERR
    Services -. "throw AppError" .-> ERR
    ERR --> ERRES([Error Response\nJSON])

    style Middleware fill:#fef3c7,stroke:#f59e0b
    style Routes fill:#e0e7ff,stroke:#6366f1
    style Controllers fill:#dcfce7,stroke:#16a34a
    style Services fill:#fce7f3,stroke:#ec4899
    style ErrorHandling fill:#fee2e2,stroke:#ef4444
```

---

## 4. Database Schema

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password
        TIMESTAMP created_at
    }

    refresh_tokens {
        UUID id PK
        UUID user_id FK
        TEXT token UK
        TIMESTAMP expires_at
        TIMESTAMP created_at
    }

    todos {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT description
        ENUM status
        ENUM priority
        TIMESTAMP deadline
        INTEGER position
        NUMERIC amount
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    todo_attachments {
        UUID id PK
        UUID todo_id FK
        UUID user_id FK
        VARCHAR original_name
        VARCHAR stored_name
        VARCHAR mime_type
        INTEGER size_bytes
        TIMESTAMP created_at
    }

    tags {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        VARCHAR color
        TIMESTAMP created_at
    }

    todo_tags {
        UUID todo_id PK,FK
        UUID tag_id PK,FK
    }

    users ||--o{ refresh_tokens : "has"
    users ||--o{ todos : "owns"
    users ||--o{ todo_attachments : "uploads"
    users ||--o{ tags : "creates"
    todos ||--o{ todo_attachments : "has"
    todos }o--o{ tags : "tagged via todo_tags"
```

> **Status values:** `pending` | `in_progress` | `done`
> **Priority values:** `low` | `medium` | `high`

---

## 5. Luồng xác thực (Auth Flow)

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend\n(authStore)
    participant BE as Backend\n(/api/auth)
    participant DB as PostgreSQL

    rect rgb(219, 234, 254)
        Note over User,DB: ĐĂNG KÝ
        User->>FE: Nhập name, email, password
        FE->>BE: POST /api/auth/register
        BE->>BE: Zod validate
        BE->>DB: INSERT users (bcrypt hash password)
        DB-->>BE: user created
        BE-->>FE: 201 { message: "success" }
        FE->>User: Chuyển → /login
    end

    rect rgb(220, 252, 231)
        Note over User,DB: ĐĂNG NHẬP
        User->>FE: Nhập email, password
        FE->>BE: POST /api/auth/login
        BE->>DB: SELECT user WHERE email
        DB-->>BE: user row
        BE->>BE: bcrypt.compare(password, hash)
        BE->>BE: signJWT → accessToken (15m)\n+ refreshToken (7d)
        BE->>DB: INSERT refresh_tokens
        BE-->>FE: { user, accessToken, refreshToken }
        FE->>FE: authStore.setAuth()\nlưu vào localStorage
        FE->>User: Chuyển → /todos
    end

    rect rgb(254, 243, 199)
        Note over FE,DB: TOKEN TỰ ĐỘNG LÀM MỚI (khi 401)
        FE->>BE: Request bất kỳ → 401 Unauthorized
        BE-->>FE: 401 (token hết hạn)
        FE->>BE: POST /api/auth/refresh\n{ refreshToken }
        BE->>DB: SELECT refresh_tokens WHERE token + valid
        DB-->>BE: token row
        BE->>BE: signJWT → accessToken mới
        BE-->>FE: { accessToken }
        FE->>FE: authStore.setAccessToken()
        FE->>BE: Retry request ban đầu (token mới)
    end

    rect rgb(254, 226, 226)
        Note over User,DB: ĐĂNG XUẤT
        User->>FE: Click Logout
        FE->>BE: POST /api/auth/logout\n{ refreshToken }
        BE->>DB: DELETE refresh_tokens WHERE token
        BE-->>FE: 200 OK
        FE->>FE: authStore.logout()\nxoá localStorage
        FE->>User: Chuyển → /login
    end
```

---

## 6. Frontend — Kiến trúc & Data Flow

```mermaid
graph TD
    subgraph Entry["Entry Point"]
        MAIN["main.tsx\nReactDOM.createRoot"]
    end

    subgraph Router["React Router v6"]
        APP["App.tsx"]
        PR["ProtectedRoute\nKiểm tra accessToken"]
    end

    subgraph Pages["Pages"]
        LP["LoginPage\n/login"]
        RP["RegisterPage\n/register"]
        TP["TodosPage\n/todos"]
    end

    subgraph Components["Components"]
        TI["TodoItem\nHiển thị card"]
        TM["TodoModal\nCreate / Edit form"]
        DND["DndContext\n@dnd-kit/core\nKéo thả Kanban"]
    end

    subgraph Stores["Zustand Stores"]
        AS["authStore\nuser, tokens\n(persist localStorage)"]
        TS["todoStore\ntodos array\nCRUD actions"]
        ATS["attachmentStore\nattachments map\nupload/delete"]
    end

    subgraph API["API Layer"]
        AX["api.ts\nAxios Instance\nbaseURL + Interceptors"]
    end

    MAIN --> APP
    APP --> PR
    APP --> LP
    APP --> RP
    PR -- "có token" --> TP
    PR -- "không token" --> LP

    TP --> DND
    DND --> TI
    TP --> TM

    TI -- "edit/delete" --> TM
    TM --> TS
    TM --> ATS
    TP --> TS
    TS --> AX
    ATS --> AX
    LP --> AS
    AS --> AX

    AX -- "Bearer Token" --> BE[(Backend API)]

    style Entry fill:#f0f9ff,stroke:#0ea5e9
    style Router fill:#e0e7ff,stroke:#6366f1
    style Pages fill:#f0fdf4,stroke:#22c55e
    style Components fill:#fce7f3,stroke:#ec4899
    style Stores fill:#fef9c3,stroke:#ca8a04
    style API fill:#fee2e2,stroke:#ef4444
```

---

## 7. Giao tiếp Frontend ↔ Backend

```mermaid
graph LR
    subgraph FE["Frontend (React)"]
        direction TB
        F1["authStore"]
        F2["todoStore"]
        F3["attachmentStore"]
    end

    subgraph AX["Axios Interceptors"]
        I1["Request:\nThêm Authorization header"]
        I2["Response:\n401 → auto refresh token"]
    end

    subgraph API["REST API Endpoints"]
        direction TB
        A1["POST /api/auth/register\nPOST /api/auth/login\nPOST /api/auth/logout\nPOST /api/auth/refresh"]
        A2["GET    /api/todos\nPOST   /api/todos\nGET    /api/todos/:id\nPUT    /api/todos/:id\nPATCH  /api/todos/:id/move\nDELETE /api/todos/:id"]
        A3["GET    /api/todos/:id/attachments\nPOST   /api/todos/:id/attachments\nDELETE /api/todos/:id/attachments/:aid"]
        A4["GET    /api/tags\nPOST   /api/tags\nDELETE /api/tags/:id\nPOST   /api/tags/todo/:id/:tagId\nDELETE /api/tags/todo/:id/:tagId"]
    end

    F1 --> I1 --> A1
    F2 --> I1 --> A2
    F3 --> I1 --> A3
    F2 --> I1 --> A4
    A1 --> I2
    A2 --> I2
    I2 --> F1
```

---

## 8. Tính năng đặc biệt

### 8.1. Kanban Position Management

```mermaid
flowchart TD
    A[Todo được kéo thả\nhoặc tạo mới] --> B{Thao tác}

    B -- "Tạo mới" --> C["todoService.create()\nSELECT MAX(position) + 1\ntrong cùng status column"]
    C --> D[Gán position cuối cùng\ntrong cột tương ứng]

    B -- "Di chuyển cột\n(Drag & Drop)" --> E["todoService.moveTodo()\nBEGIN TRANSACTION"]
    E --> F[Shift position các todo\ntrong cột đích\n≥ vị trí target +1]
    F --> G[UPDATE todo\nstatus mới + position mới]
    G --> H[COMMIT]
    H --> I[Frontend re-render\nKanban board]

    style E fill:#fef3c7,stroke:#f59e0b
    style H fill:#dcfce7,stroke:#16a34a
```

### 8.2. File Upload Flow

```mermaid
flowchart LR
    U([User chọn file]) --> MU["Multer Middleware\nvalidate 20MB limit\nfilter mime type"]
    MU --> GEN["Tạo stored_name\nUUID + extension gốc"]
    GEN --> DISK["/uploads/{stored_name}\nLưu lên disk"]
    GEN --> DB[("todo_attachments\noriginal_name, stored_name\nmime_type, size_bytes")]
    DISK --> RES([Response\nAttachment object])
    DB --> RES
```

### 8.3. Rate Limiting Strategy

| Middleware | Scope | Limit |
|---|---|---|
| `globalLimiter` | Tất cả routes | 100 req / 15 phút |
| `authLimiter` | `/api/auth/*` | 10 req / 15 phút |

### 8.4. JWT Token Strategy

| Token | Thời hạn | Lưu ở đâu | Mục đích |
|---|---|---|---|
| `accessToken` | 15 phút | Zustand (memory) | Xác thực mỗi request |
| `refreshToken` | 7 ngày | localStorage + DB | Cấp access token mới |

---

## Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State** | Zustand (persist), React Hook Form, Zod |
| **Routing** | React Router v6 |
| **Drag & Drop** | @dnd-kit/core |
| **HTTP Client** | Axios (interceptors) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 16 (pg driver, raw SQL) |
| **Auth** | JWT (access 15m + refresh 7d), bcryptjs |
| **Validation** | Zod (backend + frontend) |
| **File Upload** | Multer (disk, 20MB) |
| **Docs** | Swagger UI (`/api-docs`, dev only) |
| **Container** | Docker Compose (PostgreSQL) |

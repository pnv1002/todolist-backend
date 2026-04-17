# Sơ đồ tổng thể — Frontend / Backend / Database

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                               │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                  React 18 + TypeScript + Vite                    │  │
│   │                                                                  │  │
│   │  ┌─────────────────────────┐  ┌───────────────────────────────┐  │  │
│   │  │        Pages            │  │        Components             │  │  │
│   │  │  - /login  LoginPage    │  │  - ProtectedRoute             │  │  │
│   │  │  - /register            │  │  - TodoItem  (card)           │  │  │
│   │  │  - /todos  TodosPage    │  │  - TodoModal (form)           │  │  │
│   │  │    └─ Kanban Board      │  │  - DndContext (kéo thả)       │  │  │
│   │  └─────────────────────────┘  └───────────────────────────────┘  │  │
│   │                                                                  │  │
│   │  ┌──────────────────────────────────────────────────────────┐   │  │
│   │  │                  Zustand Stores                          │   │  │
│   │  │  authStore          todoStore        attachmentStore     │   │  │
│   │  │  - user             - todos[]        - attachments{}     │   │  │
│   │  │  - accessToken      - loading        - loading           │   │  │
│   │  │  - refreshToken     - CRUD actions   - upload/delete     │   │  │
│   │  │  (localStorage)                                          │   │  │
│   │  └──────────────────────────────────────────────────────────┘   │  │
│   │                                                                  │  │
│   │  ┌──────────────────────────────────────────────────────────┐   │  │
│   │  │              Axios Instance  (api.ts)                    │   │  │
│   │  │  Request Interceptor  → thêm Authorization: Bearer JWT   │   │  │
│   │  │  Response Interceptor → 401: tự động refresh token       │   │  │
│   │  └──────────────────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
              HTTPS  ·  JWT Bearer Token
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  BACKEND  —  Node.js + Express.js  (:3001)              │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Middleware Chain                              │ │
│  │  cors()  →  express.json()  →  globalLimiter (100 req/15min)      │ │
│  │  →  authLimiter (10 req/15min)  →  authenticate() (verify JWT)    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                          │
│              ┌───────────────┼───────────────┐                          │
│              ▼               ▼               ▼                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│   │  /api/auth   │  │  /api/todos  │  │  /api/tags   │   Routes        │
│   │  (public)    │  │  (protected) │  │  (protected) │                 │
│   └──────────────┘  └──────────────┘  └──────────────┘                 │
│          │                 │                  │                         │
│          ▼                 ▼                  ▼                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│   │authController│  │todoController│  │ tagController│   Controllers   │
│   │Zod validate  │  │Zod validate  │  │Zod validate  │                 │
│   └──────────────┘  └──────────────┘  └──────────────┘                 │
│          │                 │                  │                         │
│          ▼                 ▼                  ▼                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       Services Layer                            │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │   │
│  │  │  authService  │  │  todoService  │  │  attachmentService│   │   │
│  │  │  - register   │  │  - CRUD       │  │  - upload (Multer)│   │   │
│  │  │  - login      │  │  - position   │  │  - delete file    │   │   │
│  │  │  - refresh    │  │  - pagination │  │  tagService       │   │   │
│  │  │  - logout     │  │  - move (Txn) │  │  - many-to-many   │   │   │
│  │  │  bcrypt · JWT │  │               │  │                   │   │   │
│  │  └───────────────┘  └───────────────┘  └───────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                      │                   │
│                    errorMiddleware              Swagger UI              │
│                  AppError → HTTP status         /api-docs (dev)         │
└─────────────────────────────────────────────────────────────────────────┘
              │                                        │
              ▼                                        ▼
┌──────────────────────────────────────┐   ┌──────────────────────────┐
│   DATA LAYER                         │   │   FILE STORAGE           │
│                                      │   │                          │
│   PostgreSQL 16  (Docker :5433)      │   │   /uploads               │
│   ┌──────────────────────────────┐   │   │   - UUID filename        │
│   │  users                       │   │   │   - max 20 MB            │
│   │  refresh_tokens              │   │   │   - mime validated        │
│   │  todos                       │   │   │                          │
│   │   └─ status · priority       │   │   └──────────────────────────┘
│   │      position · amount       │   │
│   │  todo_attachments            │   │
│   │  tags                        │   │
│   │  todo_tags  (many-to-many)   │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

```mermaid
flowchart TD
    %% ─────────────────────────────────────────
    %% USER
    %% ─────────────────────────────────────────
    USER(["👤 User"])

    %% ─────────────────────────────────────────
    %% FRONTEND
    %% ─────────────────────────────────────────
    subgraph FE["🖥️  FRONTEND — React 18 + TypeScript (Vite :5173)"]
        direction TB

        subgraph FE_PAGES["Pages"]
            LP["LoginPage\n/login"]
            RGP["RegisterPage\n/register"]
            TP["TodosPage\n/todos"]
        end

        subgraph FE_COMP["Components"]
            PR["ProtectedRoute"]
            TI["TodoItem"]
            TM["TodoModal"]
            DND["DndContext\n(kéo thả)"]
        end

        subgraph FE_STATE["Zustand Stores"]
            AS["authStore\nuser · accessToken\nrefreshToken\n(localStorage)"]
            TS["todoStore\ntodos[]"]
            ATS["attachmentStore\nattachments{}"]
        end

        AX["⚡ Axios\nRequest: +Bearer Token\nResponse: auto-refresh 401"]
    end

    %% ─────────────────────────────────────────
    %% BACKEND
    %% ─────────────────────────────────────────
    subgraph BE["⚙️  BACKEND — Node.js + Express.js (TypeScript :3001)"]
        direction TB

        subgraph MW["Middleware Chain"]
            M1["cors()"]
            M2["express.json()"]
            M3["globalLimiter\n100 req/15min"]
            M4["authLimiter\n10 req/15min"]
            M5["authenticate()\nVerify JWT → req.user"]
        end

        subgraph RT["Routes"]
            R1["/api/auth\n(public)"]
            R2["/api/todos\n(protected)"]
            R3["/api/tags\n(protected)"]
        end

        subgraph CTRL["Controllers"]
            C1["authController"]
            C2["todoController"]
            C3["tagController"]
        end

        subgraph SVC["Services (Business Logic)"]
            S1["authService\nbcrypt · JWT · tokens"]
            S2["todoService\nCRUD · position · pagination"]
            S3["attachmentService\nfile CRUD"]
            S4["tagService\nmany-to-many"]
        end

        ERR["errorMiddleware\nAppError → HTTP status"]
    end

    %% ─────────────────────────────────────────
    %% DATA LAYER
    %% ─────────────────────────────────────────
    subgraph DATA["💾  DATA LAYER"]
        subgraph PG["🐘 PostgreSQL 16 (Docker :5433)"]
            TB1[("users")]
            TB2[("refresh_tokens")]
            TB3[("todos")]
            TB4[("todo_attachments")]
            TB5[("tags · todo_tags")]
        end
        FS["📁 /uploads\n(file attachments)"]
    end

    %% ─────────────────────────────────────────
    %% CONNECTIONS — User → Frontend
    %% ─────────────────────────────────────────
    USER -- "Điền form\nLogin / Register" --> LP & RGP
    USER -- "Thao tác\nTodo / Kéo thả / Upload" --> TP

    LP & RGP --> AS
    TP --> PR
    PR -- "có token" --> TP
    PR -- "không token" --> LP
    TP --> DND --> TI
    TP --> TM
    TI --> TM

    AS --> AX
    TS --> AX
    ATS --> AX

    %% ─────────────────────────────────────────
    %% CONNECTIONS — Frontend → Backend
    %% ─────────────────────────────────────────
    AX -- "HTTP/JSON\nAuthorization: Bearer JWT" --> M1

    M1 --> M2 --> M3 --> M4
    M4 --> R1
    M4 --> M5
    M5 --> R2 & R3

    R1 --> C1
    R2 --> C2
    R3 --> C3

    C1 --> S1
    C2 --> S2 & S3
    C3 --> S4

    C1 -. "throw error" .-> ERR
    C2 -. "throw error" .-> ERR
    C3 -. "throw error" .-> ERR

    %% ─────────────────────────────────────────
    %% CONNECTIONS — Backend → Data
    %% ─────────────────────────────────────────
    S1 --> TB1 & TB2
    S2 --> TB3
    S3 --> TB4 & FS
    S4 --> TB5

    %% ─────────────────────────────────────────
    %% RESPONSE
    %% ─────────────────────────────────────────
    SVC -- "JSON Response" --> AX
    ERR -- "Error Response" --> AX
    AX -- "Cập nhật Store" --> TS & AS & ATS
    TS & AS & ATS -- "Re-render UI" --> FE_PAGES

    %% ─────────────────────────────────────────
    %% STYLE
    %% ─────────────────────────────────────────
    classDef page    fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    classDef comp    fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef store   fill:#fef9c3,stroke:#ca8a04,color:#451a03
    classDef mw      fill:#fef3c7,stroke:#f59e0b,color:#451a03
    classDef ctrl    fill:#dcfce7,stroke:#16a34a,color:#052e16
    classDef svc     fill:#fce7f3,stroke:#ec4899,color:#500724
    classDef db      fill:#f0fdf4,stroke:#22c55e,color:#052e16
    classDef err     fill:#fee2e2,stroke:#ef4444,color:#450a0a

    class LP,RGP,TP page
    class PR,TI,TM,DND comp
    class AS,TS,ATS store
    class M1,M2,M3,M4,M5 mw
    class C1,C2,C3 ctrl
    class S1,S2,S3,S4 svc
    class TB1,TB2,TB3,TB4,TB5,FS db
    class ERR err
```

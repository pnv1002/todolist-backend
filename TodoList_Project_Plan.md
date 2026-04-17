# 📋 Project Plan: TodoList App

## 1. Tổng quan dự án

Xây dựng ứng dụng TodoList web full-stack cho phép người dùng đăng ký,
đăng nhập và quản lý danh sách công việc cá nhân (CRUD).

## 2. Tech Stack

-   **Frontend:** React + TypeScript + Tailwind CSS\
-   **Backend:** Node.js + Express.js\
-   **Database:** PostgreSQL \
-   **Auth:** JWT (Access Token + Refresh Token)\
-   **API:** RESTful API\
-   **State Management:** Zustand (hoặc Redux Toolkit)\
-   **Form Validation:** React Hook Form + Zod
-   **Run CODE:** dùng tất cả bằng docker

## 3. Tính năng chính

### 🔐 Authentication

-   POST /api/auth/register --- Đăng ký
-   POST /api/auth/login --- Đăng nhập
-   POST /api/auth/logout --- Đăng xuất
-   POST /api/auth/refresh --- Refresh token

### ✅ Todo CRUD

-   POST /api/todos --- Tạo todo
-   GET /api/todos --- Danh sách todo
-   GET /api/todos/:id --- Chi tiết todo
-   PUT /api/todos/:id --- Cập nhật todo
-   DELETE /api/todos/:id --- Xóa todo

## 4. Data Models

### User

-   id: UUID
-   name: string
-   email: string (unique)
-   password: hashed
-   created_at: timestamp

### Todo

-   id: UUID
-   user_id: UUID
-   title: string
-   description: string
-   status: pending \| in_progress \| done
-   priority: low \| medium \| high
-   deadline: date
-   created_at: timestamp
-   updated_at: timestamp

## 5. API Endpoints

### Auth

  Method   Endpoint             Mô tả
  -------- -------------------- ---------------
  POST     /api/auth/register   Đăng ký
  POST     /api/auth/login      Đăng nhập
  POST     /api/auth/logout     Đăng xuất
  POST     /api/auth/refresh    Refresh token

### Todo

  Method   Endpoint         Mô tả
  -------- ---------------- ---------------
  GET      /api/todos       Lấy danh sách
  POST     /api/todos       Tạo mới
  GET      /api/todos/:id   Chi tiết
  PUT      /api/todos/:id   Cập nhật
  DELETE   /api/todos/:id   Xóa

## 6. Cấu trúc thư mục

### Frontend

    src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── store/
    ├── services/
    ├── types/
    └── utils/

### Backend

    src/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    └── app.ts / server.ts

## 7. UI Screens

-   /register
-   /login
-   /todos
-   Modal tạo/sửa Todo

## 8. Business Logic

-   Email hợp lệ, không trùng
-   Password \>= 8 ký tự
-   Todo title không rỗng
-   User chỉ thao tác dữ liệu của mình
-   Access Token: 15 phút
-   Refresh Token: 7 ngày

## 9. Error Handling

-   400: Bad Request
-   401: Unauthorized
-   403: Forbidden
-   404: Not Found
-   409: Conflict
-   500: Server Error

## 10. Sprint (2 tuần)

### Sprint 1

-   Setup backend
-   Auth API
-   Todo API
-   Unit test

### Sprint 2

-   Frontend
-   UI + API integration
-   Responsive + UX
-   Test & deploy

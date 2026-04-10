# Changelog

## [v0.0.1] — 2026-04-10

Phiên bản phát hành đầu tiên của **TodoList Backend**.

### Tính năng

#### Xác thực người dùng (Auth)
- Đăng ký tài khoản với email + mật khẩu (bcrypt hash)
- Đăng nhập trả về Access Token (15 phút) + Refresh Token (7 ngày)
- Làm mới Access Token qua Refresh Token
- Đăng xuất và thu hồi Refresh Token

#### Quản lý công việc (Todos)
- Tạo, xem, cập nhật, xóa todo (CRUD)
- Hỗ trợ trường: tiêu đề, mô tả, trạng thái, mức độ ưu tiên, deadline
- `status`: `pending` | `in_progress` | `done`
- `priority`: `low` | `medium` | `high`
- Mỗi user chỉ truy cập được todo của chính mình

#### Bảo mật
- JWT xác thực toàn bộ endpoint Todos
- Mật khẩu được hash bằng bcryptjs trước khi lưu
- Refresh Token lưu DB, bị thu hồi khi logout
- Validation đầu vào bằng Zod, trả lỗi rõ ràng

#### Hạ tầng
- Tách biệt môi trường dev / production qua `.env.development` và `.env.production`
- Swagger UI tự động tắt ở production (`/api-docs` chỉ khả dụng khi dev)
- Global error handler cho `AppError` và `ZodError`
- Database tự khởi tạo bảng khi server start (`initDB`)

### Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`), bcryptjs, Zod, Swagger UI

### API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/todos` | Danh sách todos |
| POST | `/api/todos` | Tạo todo |
| GET | `/api/todos/:id` | Chi tiết todo |
| PUT | `/api/todos/:id` | Cập nhật todo |
| DELETE | `/api/todos/:id` | Xóa todo |

### Giới hạn đã biết

- Chưa có rate limiting
- Chưa có email verification khi đăng ký
- Chưa hỗ trợ upload ảnh đại diện
- Chưa có pagination cho danh sách todos

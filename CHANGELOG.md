# Changelog

## [v0.1.0] — 2026-04-10

### Tính năng mới

#### Kéo thả công việc (Drag & Drop)
- Thêm cột `position` vào bảng `todos` — lưu thứ tự hiển thị trong mỗi cột Kanban
- `PATCH /api/todos/:id/move` — di chuyển todo sang cột khác hoặc đổi thứ tự, dùng DB transaction đảm bảo tính toàn vẹn

#### Đính kèm file
- Bảng `todo_attachments` lưu metadata file (tên gốc, tên lưu, mime type, kích thước)
- `POST /api/todos/:id/attachments` — upload file (multipart/form-data, tối đa 20MB)
- `GET /api/todos/:id/attachments` — danh sách file đính kèm của todo
- `DELETE /api/todos/:id/attachments/:attachmentId` — xóa file đính kèm (cả DB và file thật)
- File được phục vụ tĩnh tại `GET /uploads/<filename>`

#### Số tiền (Amount)
- Thêm cột `amount NUMERIC(15,2)` vào bảng `todos`
- Hỗ trợ khai báo số tiền khi tạo và cập nhật todo

### Thay đổi khác
- `GET /api/todos` — sắp xếp theo `status, position ASC` thay vì `created_at DESC`
- `POST /api/todos` — tự động gán `position` tiếp theo trong cột tương ứng
- Migrate tự động: `ALTER TABLE IF NOT EXISTS` cho bảng todos đã tồn tại

---

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

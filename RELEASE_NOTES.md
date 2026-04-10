# Release Notes — v0.0.2

**Ngày phát hành:** 10/04/2026
**Tag:** `v0.0.2`
**Nhánh:** `main`
**Phiên bản trước:** `v0.0.1`

---

## Tổng quan

Phiên bản `v0.0.2` mở rộng đáng kể tính năng của API backend với khả năng phân trang, tìm kiếm, lọc todo, quản lý nhãn (tags), đính kèm file, di chuyển todo giữa các cột (drag & drop), và bảo vệ server bằng rate limiting.

---

## Tính năng mới

### Rate Limiting
- Giới hạn **100 request / 15 phút** cho toàn bộ API
- Giới hạn nghiêm hơn **10 request / 15 phút** riêng cho các endpoint Auth (`/api/auth/*`) để chống brute-force
- Trả về header chuẩn `RateLimit-*` cho client

### Phân trang (Pagination)
- `GET /api/todos` hỗ trợ query params `?page=1&limit=20`
- Response trả về object có cấu trúc:
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Tìm kiếm & Lọc (Search & Filter)
- `?search=keyword` — tìm kiếm theo tiêu đề và mô tả (không phân biệt hoa thường)
- `?status=pending|in_progress|done` — lọc theo trạng thái
- `?priority=low|medium|high` — lọc theo mức độ ưu tiên
- Có thể kết hợp nhiều tham số cùng lúc

### Quản lý nhãn (Tags / Labels)
- Mỗi user tự tạo bộ nhãn riêng với tên và màu sắc (hex color)
- `GET /api/tags` — danh sách nhãn của user
- `POST /api/tags` — tạo nhãn mới `{ name, color }`
- `DELETE /api/tags/:id` — xóa nhãn
- `POST /api/tags/todo/:id/:tagId` — gắn nhãn vào todo
- `DELETE /api/tags/todo/:id/:tagId` — gỡ nhãn khỏi todo
- Danh sách nhãn được trả về kèm trong mỗi todo (field `tags`)

### Kéo thả (Drag & Drop)
- `PATCH /api/todos/:id/move` — body: `{ status, position }`
- Dùng DB transaction để reorder an toàn, không bị xung đột khi di chuyển trong cùng cột hoặc sang cột khác
- Cột `position` tự động gán khi tạo todo mới

### Đính kèm file (Attachments)
- `POST /api/todos/:id/attachments` — upload file (multipart/form-data, tối đa 20MB)
- `GET /api/todos/:id/attachments` — danh sách file đính kèm
- `DELETE /api/todos/:id/attachments/:attachmentId` — xóa file (cả DB lẫn file thật)
- File phục vụ tĩnh tại `GET /uploads/<filename>`

### Trường số tiền (Amount)
- Thêm field `amount NUMERIC(15,2)` vào todo
- Hỗ trợ truyền qua `POST /api/todos` và `PUT /api/todos/:id`

---

## Thay đổi cơ sở dữ liệu

| Thay đổi | Chi tiết |
|----------|---------|
| `todos.position` | Thứ tự hiển thị trong cột Kanban |
| `todos.amount` | Số tiền liên quan đến task |
| Bảng `tags` | Quản lý nhãn của user (id, user_id, name, color) |
| Bảng `todo_tags` | Quan hệ nhiều-nhiều giữa todo và tag |
| Bảng `todo_attachments` | Metadata file đính kèm |
| Migration tự động | `ALTER TABLE IF NOT EXISTS` khi server khởi động |

---

## API mới trong phiên bản này

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| PATCH | `/api/todos/:id/move` | Di chuyển todo (drag & drop) |
| GET | `/api/todos/:id/attachments` | Danh sách file đính kèm |
| POST | `/api/todos/:id/attachments` | Upload file đính kèm |
| DELETE | `/api/todos/:id/attachments/:attachmentId` | Xóa file đính kèm |
| GET | `/api/tags` | Danh sách nhãn |
| POST | `/api/tags` | Tạo nhãn mới |
| DELETE | `/api/tags/:id` | Xóa nhãn |
| POST | `/api/tags/todo/:id/:tagId` | Gắn nhãn vào todo |
| DELETE | `/api/tags/todo/:id/:tagId` | Gỡ nhãn khỏi todo |

---

## Thư viện mới

| Thư viện | Mục đích |
|----------|---------|
| `express-rate-limit` | Giới hạn số request chống spam/brute-force |
| `multer` | Xử lý upload file |

---

## Ghi chú

- File upload được lưu tại thư mục `uploads/` — cần đảm bảo thư mục tồn tại trước khi chạy
- Rate limit áp dụng theo IP, có thể điều chỉnh trong `src/middlewares/rateLimitMiddleware.ts`
- Endpoint `GET /api/todos` đã thay đổi cấu trúc response (có thêm wrapper pagination) — frontend cần cập nhật theo

---

# Release Notes — v0.0.1

**Ngày phát hành:** 10/04/2026
**Tag:** `v0.0.1`
**Nhánh:** `main`

---

## Giới thiệu

Phiên bản đầu tiên của **TodoList Backend** — REST API xây dựng bằng Node.js + Express + TypeScript + PostgreSQL.

---

## Tính năng ra mắt

### Xác thực người dùng (Auth)
- Đăng ký tài khoản với email + mật khẩu (bcrypt hash)
- Đăng nhập trả về Access Token (15 phút) + Refresh Token (7 ngày)
- Làm mới Access Token qua Refresh Token
- Đăng xuất và thu hồi Refresh Token

### Quản lý công việc (Todos)
- CRUD đầy đủ: tạo, xem, cập nhật, xóa todo
- Hỗ trợ trường: tiêu đề, mô tả, trạng thái, mức độ ưu tiên, deadline
- Mỗi user chỉ truy cập được todo của chính mình

### Bảo mật
- JWT xác thực toàn bộ endpoint Todos
- Validation đầu vào bằng Zod
- Global error handler

### Hạ tầng
- Tách biệt môi trường dev/production
- Swagger UI (chỉ bật ở dev)
- Database tự khởi tạo bảng khi server start

---

## Hướng dẫn cài đặt

```bash
git clone https://github.com/pnv1002/todolist-backend.git
cd todolist-backend
npm install
cp .env.example .env.development
npm run dev
```

> Xem chi tiết cấu hình trong [README.md](README.md)

---

## Ghi chú

- Đây là phiên bản **alpha** — chưa dành cho môi trường production
- Cần PostgreSQL đang chạy và cấu hình `DATABASE_URL` trong `.env.development`

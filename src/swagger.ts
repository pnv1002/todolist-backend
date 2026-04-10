import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TodoList API',
      version: '1.0.0',
      description: 'REST API cho ứng dụng TodoList — xác thực JWT + CRUD todos',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            name:       { type: 'string', example: 'Nguyen Van A' },
            email:      { type: 'string', format: 'email', example: 'user@example.com' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Todo: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            user_id:     { type: 'string', format: 'uuid' },
            title:       { type: 'string', example: 'Hoàn thành báo cáo' },
            description: { type: 'string', example: 'Báo cáo tháng 4' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'done'],
              example: 'pending',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'medium',
            },
            deadline:   { type: 'string', format: 'date', nullable: true, example: '2026-05-01' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        TodoInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title:       { type: 'string', example: 'Hoàn thành báo cáo' },
            description: { type: 'string', example: 'Báo cáo tháng 4' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'done'],
              default: 'pending',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
            },
            deadline: { type: 'string', format: 'date', nullable: true, example: '2026-05-01' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
      },
    },
    paths: {
      // ─── AUTH ───────────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng ký tài khoản mới',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name:     { type: 'string', example: 'Nguyen Van A' },
                    email:    { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', minLength: 8, example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Đăng ký thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { user: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Email đã tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng nhập',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Đăng nhập thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken:  { type: 'string' },
                      refreshToken: { type: 'string' },
                      user:         { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: 'Sai email hoặc mật khẩu', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Làm mới Access Token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Trả về access token mới',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { accessToken: { type: 'string' } },
                  },
                },
              },
            },
            401: { description: 'Refresh token không hợp lệ hoặc hết hạn', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng xuất',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Đăng xuất thành công',
              content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Logged out' } } } } },
            },
          },
        },
      },

      // ─── TODOS ──────────────────────────────────────────────────────────
      '/api/todos': {
        get: {
          tags: ['Todos'],
          summary: 'Lấy danh sách todos',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Danh sách todos của user',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Todo' } } } },
            },
            401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          tags: ['Todos'],
          summary: 'Tạo todo mới',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TodoInput' } } },
          },
          responses: {
            201: { description: 'Tạo thành công', content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/todos/{id}': {
        get: {
          tags: ['Todos'],
          summary: 'Lấy chi tiết todo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Chi tiết todo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } },
            401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Không tìm thấy', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          tags: ['Todos'],
          summary: 'Cập nhật todo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TodoInput' } } },
          },
          responses: {
            200: { description: 'Cập nhật thành công', content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Không tìm thấy', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Todos'],
          summary: 'Xóa todo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Xóa thành công', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Deleted' } } } } } },
            401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Không tìm thấy', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

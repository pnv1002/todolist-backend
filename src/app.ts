import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { swaggerSpec } from './swagger';
import { env } from './config/env';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Swagger chỉ bật ở môi trường development
if (env.isDev) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
}

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use(errorHandler);

export default app;

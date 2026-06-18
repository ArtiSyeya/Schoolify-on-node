import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

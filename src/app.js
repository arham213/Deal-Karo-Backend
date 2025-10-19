import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use('/api', router);

// error handler middleware
app.use(errorHandler);

export default app;
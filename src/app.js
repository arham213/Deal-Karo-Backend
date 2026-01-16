import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true
}));

// routes
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Welcome to Deal Kroo Backend');
});

// error handler middleware
app.use(errorHandler);

export default app;
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

// app.get('/', (req, res) => {
//   res.send('Welcome to Deal Krein Backend');
// });

// app.get('/', (req, res) => {
//   res.status(200).send('OK');
// });


app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Deal Karo Backend is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// error handler middleware
app.use(errorHandler);

export default app;
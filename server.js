import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';
import startCronJobs from './src/utils/scheduler.js';

dotenv.config();

const startServer = async () => {
    await connectDB();
    startCronJobs();
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
}

startServer();
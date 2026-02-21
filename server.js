import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import app from './src/app.js';
import setupSocket from './src/socket/socketHandler.js';
import startCronJobs from './src/utils/scheduler.js';

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

dotenv.config();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: '*', // In production, specify your frontend URL
        methods: ['GET', 'POST']
    }
});

// Setup Socket.IO
setupSocket(io);

const startServer = async () => {
    await connectDB();

    console.log("process.env.PORT is:", process.env.PORT);
    const PORT = process.env.PORT;

    if (!PORT) {
        console.error("PORT not provided by host!");
        process.exit(1);
    }


    server.listen(PORT, () => {
        console.log(`Server Running on Port: ${PORT}`);
        console.log(`Socket.IO is ready for connections`);

        // startCronJobs();
    });
}

startServer();
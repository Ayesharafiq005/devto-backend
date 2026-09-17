import dotenv from 'dotenv';
import http from 'http';
import {Server } from 'socket.io';
import { app } from "./app.js";
import connectDB  from './config/db.js';

dotenv.config({
    path: "./.env"
})

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods : ["GET", "POST"]
    }
});

app.set("io",io);

io.on("connection", (socket) => {
    console.log(`User connected : ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`User disconnected : ${socket.id}`)
    })
})

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`)
    })
})
.catch((err) => {
    console.log(`MongoDB connection failed `, err)
})
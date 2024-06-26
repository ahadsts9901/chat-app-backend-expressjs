import "./mongodb.mjs"
import 'dotenv/config'

import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { createServer } from "http";
import { Server as socketIo } from 'socket.io';

import unAuthenticatedAuthRouter from './routes/un-auth-routes/auth.mjs'
import authenticatedProfileRouter from './routes/auth-routes/profile.mjs'
import authenticatedChatRouter from './routes/auth-routes/chat.mjs'

import { globalIoObject } from "./core.mjs"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.use("/api/v1", unAuthenticatedAuthRouter)

app.use("/api/v1", (req, res, next) => {

    const hart = req.cookies.hart;

    try {

        const currentUser = jwt.verify(hart, process.env.SECRET);

        req.currentUser = { ...currentUser };

        next();

    } catch (error) {
        console.error(error);
        res.status(401).send({
            message: "unauthorized",
        });
        return;
    }

});

app.use("/api/v1", authenticatedProfileRouter)
app.use("/api/v1", authenticatedChatRouter)

// socket

const server = createServer(app);

const io = new socketIo(server, { cors: { origin: "*", methods: "*", } });
globalIoObject.io = io;

io.on("connection", (socket) => {
    console.log("new client connected with id: ", socket?.id);
})

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
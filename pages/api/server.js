import { Server } from "socket.io";

import PRINT from '../../Modules/production';

export default function handler(req, res) {
    if (res.socket.server.io) {
        PRINT("Socket is already running");
    } else {
        PRINT("Socket is initializing");

        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", (socket) => {

            socket.on("chat", (msg) => {
                socket.broadcast.emit(msg.recipent, msg);
            });

            socket.on("MakeCall", (data) => {
                // call a user
            });

            socket.on("AnswerCall", (data) => {
                // Recieve a call
            })

        });
    }
    res.end();
}

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

            socket.emit("me", socket.id)

            socket.on("chat", (msg) => {
                socket.broadcast.emit(msg.recipent, msg);
            });

            socket.on("MakeCall", (data) => {
                // call a user
                /**
                 * io.to(
                        -send to specific sopcket.id
                    ).emit(
                        "label", data
                    )
                */
                //    console.log(data);
                PRINT(data.from)
                socket.broadcast.emit(data.user, {
                    caller: data.from,
                    signal: data.signal
                })
            });

            socket.on("AnswerCall", (data) => {
                // Recieve a call
                /**
                 * io.to(
                        -send to specific sopcket.id
                    ).emit(
                        "label", data
                    )
                */
               PRINT(data.to)
                socket.broadcast.emit(`callAccepted${data.to}`, data.signal)
            })

        });
    }
    res.end();
}

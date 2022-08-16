import http from "http";
//import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";
import { parse } from "path";

import { instrument } from "@socket.io/admin-ui";

const app = express();


app.set("view engine", "pug");
app.set("views", __dirname + "/views"); //specify template directory to express
app.use("/public", express.static(__dirname + "/public")); //create public url to share files to user
app.get("/", (req, res) => res.render("home")); //make route handler to render home.pug
app.get("/*", (req, res) => res.render("/")); //catchall?

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors : {
        origin : ["https://admin.socket.io"],
        credentials : true,
    },
});
instrument(wsServer, {
    auth: false,
});

function publicRooms(){
    /*
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;*/
    const {
        sockets : {
            adapter: {sids, rooms}
        }
    } = wsServer;
    const publicRoom = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRoom.push(key);
        }
    });
    return publicRoom;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", (socket) => {
    /*socket.onAny((event) => {
        console.log(`Socket Event : ${event}`);
    });*/
    socket["nickname"] = "#Anon";
    socket.on("enter", (roomname, done) => {
        socket.join(roomname);
        done(roomname, countRoom(roomname));
        socket.to(roomname).emit("welcome", socket["nickname"], countRoom(roomname));
        wsServer.sockets.emit("room_chg", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("out", socket["nickname"], countRoom(room) - 1));
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_chg", publicRooms());
    });
    socket.on("new_msg", (val, room, done) => {
        socket.to(room).emit("new_msg", `${socket["nickname"]} : ${val}`);
        done();
    });
    socket.on("nick", (nick) => socket["nickname"] = nick);
    socket.on("start", (done) => {
        socket.emit("room_chg", publicRooms());
    });
    socket.on("quit", (roomname)=> {
        socket.rooms.forEach((room) => socket.to(room).emit("out", socket["nickname"], countRoom(room) - 1));
        socket.leave(roomname);
        wsServer.sockets.emit("room_chg", publicRooms());
    });
});

/*
const wss = new WebSocket.Server({ server }); 

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Unknown";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected to Browser") );
    socket.on("message", (message) => {
        const parsed = JSON.parse(message);
        switch(parsed.type){
            case "new_message":
                sockets.forEach((skt) => skt.send(`${socket.nickname}: ${parsed.payload}`));
                break;
            case "nickname":
                socket["nickname"] = parsed.payload;

        }
    });
});
*/

httpServer.listen(3000, handleListen);
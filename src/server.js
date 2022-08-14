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
const wsServer = new Server(httpServer);

httpServer.listen(3000, handleListen);
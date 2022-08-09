import express from "express";

const app = express();


app.set("view engine", "pug");
app.set("views", __dirname + "/views"); //specify template directory to express
app.use("/public", express.static(__dirname + "/public")); //create public url to share files to user
app.get("/", (req, res) => res.render("home")); //make route handler to render home.pug

const handleListen = () => console.log(`Listening on http://localhost:3000`);

app.listen(3000, handleListen);
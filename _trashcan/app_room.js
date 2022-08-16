//import { json } from "express";
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nickForm = document.querySelector("#nick form");
const roomForm = room.querySelector("#room");
const roomTitle = roomForm.querySelector("h3");
const msgForm = room.querySelector("#msg");
const ul = roomForm.querySelector("ul");
//const roomForm = document.querySelector("#room form#room")

let roomName;

nickForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    const input = nickForm.querySelector("input");
    const inputName = input.value;
    const ask = nickForm.querySelector("h4");
    ask.innerText = `Hi, ${inputName}.`;
    input.placeholder = inputName;
    const btn = nickForm.querySelector("button");
    btn.innerText = "Change Name";
    socket.emit("nick", inputName);
    input.value = "";
});

//room.hidden = true;

function addMessage(message){
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}


msgForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = msgForm.querySelector("input");
    const msg = input.value;
    socket.emit("new_msg", msg, roomName, ()=> {
        addMessage(`You: ${msg}`);
    });
    input.value = "";
});

function showRoom(roomname, cnt){
    welcome.hidden = true;
    room.hidden = false;
    roomName = roomname;
    roomTitle.innerText = `Room ${roomname} (${cnt})`;
};

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter", input.value, showRoom); ///function will be called on backend, but activated on frontend
    console.log(`Success for Entering ${input.value}`);
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (name, cnt) => {
    roomTitle.innerText = `Room ${roomName} (${cnt})`;
    addMessage(`"${name}" joined!`); 
});

socket.on("out", (name, cnt)=>{
    roomTitle.innerText = `Room ${roomName} (${cnt})`;
    addMessage(`"${name}" left T^T`);
})

socket.on("new_msg", addMessage);

socket.on("room_chg", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});

socket.emit("start");

roomForm.addEventListener("submit", (event)=> {
    event.preventDefault();
    ul.innerHTML = "";
    room.hidden = true;
    welcome.hidden = false;
    socket.emit("quit", roomName);
});


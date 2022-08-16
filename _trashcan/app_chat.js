const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`wss://${window.location.host}`); //wss for submition on sandbox(nomadcoder challenge)

function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg); 
}


socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected to Server");
})


function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input"); 
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const nick = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", nick.value));
    nick.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
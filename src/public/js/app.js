const socket = io();

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");


const myFace = document.getElementById("mine");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

let roomName;

/** @type {RTCPeerConnection} */
let myPeerConnection;
let myDataChannel;

async function getCameraDevices() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentcamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera=> {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentcamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        });
    } catch (err){
        console.log(err);
    };
}

async function getMedia(deviceId) {
    const initConstrains = {
        audio : true,
        video : { facingMode : "user "},
    };
    const cameraConstrains = {
        audio : true,
        video : { deviceId : { exact : deviceId}}
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initConstrains
        );
        if(muted){
            myStream.getAudioTracks().forEach(track=>{
                track.enabled = false;
            });
        }
        if(cameraOff){
            myStream.getVideoTracks().forEach(track=>{
                track.enabled = false;
            });
        }
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameraDevices();
        }
    } catch(err){
        console.log(err);
    };
}

muteBtn.addEventListener("click", (event) => {
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
})
cameraBtn.addEventListener("click", (event) => {
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if(!cameraOff){
        cameraBtn.innerText = "Camera on";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "Camera off";
        cameraOff = false;
    }
});

async function handleCameraChange(){
    await getMedia(cameraSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

cameraSelect.addEventListener("input", handleCameraChange);
//////////////////////
const welcomeForm = welcome.querySelector("form");


async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

welcomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    roomName = input.value;
    input.value = "";
    await initCall();
    socket.emit("enter", roomName);

});


//////
socket.on("join", async ()=>{
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", handleMsg);
    console.log("someone joined");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer)=> {
    myPeerConnection.addEventListener("datachannel", (event)=>{
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", handleMsg);
    })
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

socket.on("answer", answer =>{
    myPeerConnection.setRemoteDescription(answer);
});
socket.on("ice", (ice)=>{
    console.log("recieve");
    myPeerConnection.addIceCandidate(ice);
});

////RTC
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    const peersStream = document.getElementById("peersStream");
    peersStream.srcObject = data.stream;
}

/////

const chatForm = document.querySelector("#chat form");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = chatForm.querySelector("input");
  const msg = input.value;
  input.value = "";
  addMessage(`You say : ${msg}`, true);
  myDataChannel.send(msg);
});

function addMessage(msg, flag) {
  const ul = chatForm.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  if (!flag) li.style.color = "#0000ff";
  ul.appendChild(li);
}

function handleMsg(event) {
  addMessage(`Peer says : ${event.data}`, false);
}

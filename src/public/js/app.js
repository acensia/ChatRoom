const socket = io();

const myFace = document.getElementById("mine");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameraDevices() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentcamera = myStream.getVideoTracks()[0];
        console.log(cameras);
        cameras.forEach(camera=> {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
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
        myFace.srcObject = myStream;
        await getCameraDevices();
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
}

cameraSelect.addEventListener("input", handleCameraChange());


getMedia();
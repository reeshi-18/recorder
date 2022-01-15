const videoElement = document.querySelector("video");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const videoSelectBtn = document.getElementById("videoSelect");

videoSelectBtn.onclick = getVideoSource;

const { desktopCapture, remote, dialog } = require("electron");
const { writeFile } = require("original-fs");
const { Menu } = remote;

async function getVideoSource() {
  const inputSources = await desktopCapture.getSources({
    types: ["window", "screen"],
  });

  const videoOptions = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
  videoOptions.popup();
}

async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;
  videoElement.play();

  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
    recordedChunks.push(e.data);

    async function handleStop(e) {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        });
        const buffer = Buffer.from(await blob.arrayBuffer());

        const {filePath} = await dialog.showSaveDialog({
            buttonLabel: 'Save video',
            defaultPath: `vid-${Date.now()}.webm`
        });
        console.log(filePath);

        writeFile(filePath, buffer, () => console.log('video saved'));
    }
}
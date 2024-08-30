<template>
  <div>
    <input type="text" v-model="inputText" />
    <button @click="client()">点击链接</button>
    <button @click="send(inputText)">点击发送</button>
    <button @click="playBlob(blobs)">点击播放</button>
    <audio ref="audioPlayer" id="audioPlayer" controls>
      <source :src="audioUrl" type="audio/mpeg" autoplay />
      Your browser does not support the audio element.
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { WebSocketClient } from "../utils/websoket/index";
import { TencentTTS } from '../utils/TTS';

defineProps({
  msg: String,
});
const audioPlayer = ref(null);
// let sourceBuffer = null;
// let mediaSource = null;
const blobs = ref([]);
const show = ref(false);
const audioUrl = ref();
let mediaSource = new MediaSource();
let sourceBuffer;
let queue = [];
let isUpdating = false;

let currentTime = new Date();
currentTime.setMinutes(currentTime.getMinutes() + 30);
let timestampAfter30Minutes = Math.floor(currentTime.getTime() / 1000); // 转换为秒级时间戳
let inputText = ref("");
const secretKey = "30lJkIm4BA9Z8hDTXXSDsSyOjx4A8udE";
let options = {
  Action: "TextToStreamAudioWSv2",
  AppId: 1328786870,
  Codec: "mp3",
  EnableSubtitle: "True",
  Expired: timestampAfter30Minutes,
  SampleRate: 16000,
  SecretId: "AKIDoTvDIAMuOzR4gOjw0zZ0JUYVWWfjgXUS",
  SessionId: timestampAfter30Minutes + 360000,
  Speed: 0,
  Timestamp: Math.floor(timestampAfter30Minutes / 1000), // 确保是秒级时间戳
  VoiceType: 101001,
  Volume: 0,
};

let ws;

let sendObj = {
  session_id: "",
  message_id: "",
  action: "ACTION_SYNTHESIS",
  data: "",
};

// const appendBuffer = (blob) => {
//   const reader = new FileReader();
//   reader.onload = () => {
//     const arrayBuffer = reader.result;
//     if (sourceBuffer && !sourceBuffer.updating && !audioPlayer.value.error ) {
//       sourceBuffer.appendBuffer(arrayBuffer);
//     }
//   };
//   reader.readAsArrayBuffer(blob);
// };

// const onSourceOpen = () => {
//   if (!sourceBuffer) {
//     sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
//     sourceBuffer.addEventListener('updateend', () => {
//       // 当 sourceBuffer 更新结束时，可以继续追加数据
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.onmessage((res) => {
//           if (typeof res.data == "object") {
//             appendBuffer(res.data);
//           }
//         });
//       }
//     });
//   }
// };

const appendBuffer = (blob) => {
  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result;
    queue.push(arrayBuffer);
    processQueue();
  };
  reader.readAsArrayBuffer(blob);
};

const processQueue = () => {
  if (queue.length > 0 && !isUpdating && sourceBuffer && !audioPlayer.error) {
    console.log(
      "%c [ queue ]-102-「HelloWorld」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      queue
    );
    const buffer = queue.shift();

    isUpdating = true;
    sourceBuffer.appendBuffer(buffer);
  }
};

const onSourceOpen = () => {
  if (!sourceBuffer) {
    sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
    sourceBuffer.mode = "sequence"; // Ensure the buffer is appended in sequence
    sourceBuffer.addEventListener("updateend", () => {
      isUpdating = false;
      processQueue(); // Continue processing the queue after each update
    });
  }
};
mediaSource.addEventListener("sourceopen", onSourceOpen);

const client = async () => {
  sourceBuffer = null;
  mediaSource = null;
  const tencentTTS = new TencentTTS({}, secretKey);
  let TENCENT_TTS_WS_URL = await tencentTTS.buildUrl();

  ws = new WebSocketClient(TENCENT_TTS_WS_URL);

  ws.connect();
  ws.onmessage((res) => {
    if (typeof res.data == "object") {
      appendBuffer(res.data);
    } else {
      let data = JSON.parse(res.data);

      if (data.final == 0) {
        // 表示合成完毕
        // ws.close();
      }
      if (data.ready === 1) {
        console.log(
          "%c [ 准备完成，可以发送文本 ]-120-「HelloWorld」",
          "font-size:13px; background:pink; color:#bf2c9f;",
          data.ready
        );
      }
    }
  });
  ws.onerror((err) => {
    console.log(
      "%c [ err ]-83-「HelloWorld」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      err
    );
  });
  mediaSource = new MediaSource();
  mediaSource.addEventListener("sourceopen", onSourceOpen);

  // 设置 audio 元素的 src 属性
  audioPlayer.value.src = URL.createObjectURL(mediaSource);
};

let isShow = ref(false);
let blobUr = ref("");

function playBlob(blob) {
  isShow.value = true;
  const newBolb = new Blob([...blob], { type: "audio/mp3" });
  const blobUrl = URL.createObjectURL(newBolb);
  blobUr.value = blobUrl;
  isShow.value = true;
  const audio = new Audio(blobUrl);
  audio.onended = function () {
    URL.revokeObjectURL(blobUrl);
  };
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 9000000000) + 1000000000;
}

const send = (text) => {
  sendObj.data = text;
  sendObj.session_id = generateRandomNumber();
  sendObj.message_id = generateRandomNumber();
  ws.send(JSON.stringify(sendObj));
  console.log(
    "%c [ JSON.stringify(sendObj) ]-240-「HelloWorld」",
    "font-size:13px; background:pink; color:#bf2c9f;",
    JSON.stringify(sendObj)
  );
};

onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener("error", (e) => {
      console.error("音频播放错误:", e);
    });
  }
  const audioPlayerDOm = document.getElementById("audioPlayer"); // Assume you have an <audio> element with this id
  audioPlayerDOm.src = URL.createObjectURL(mediaSource);
});
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

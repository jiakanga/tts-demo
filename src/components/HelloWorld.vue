<script setup>
import { ref, onMounted } from "vue";
import { WebSocketClient } from "../utils/websoket/index";
import { TencentTTS } from "../utils/TTS";

defineProps({
  msg: String,
});

const blobs = ref([]);

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
const client = async () => {
  const tencentTTS = new TencentTTS({}, secretKey);
  let TENCENT_TTS_WS_URL = await tencentTTS.buildUrl();

  ws = new WebSocketClient(TENCENT_TTS_WS_URL);

  ws.connect();
  ws.onmessage((res) => {
    if (typeof res.data == "object") {
      blobs.value.push(res.data);
    } else {
      let data = JSON.parse(res.data);

      if (data.final) {
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
    // 同原生方法
    // ws.send("自定义发送的数据");
    // playTtsAudio(res.data);
  });
  ws.onerror((err) => {
    console.log(
      "%c [ err ]-83-「HelloWorld」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      err
    );
    // ws.close();
  });
};
let isShow = ref(false);
let blobUr = ref("");
// 创建一个函数来播放 Blob
function playBlob(blob) {
  isShow.value = false;
  const newBolb = new Blob([...blob], { type: "audio/mp3" });
  // 将 Blob 转换为 URL
  const blobUrl = URL.createObjectURL(newBolb);
  blobUr.value = blobUrl;
  isShow.value = true;
  // 创建一个新的 audio 元素
  const audio = new Audio(blobUrl);

  // 当音频播放完毕后，释放 URL 对象
  audio.onended = function () {
    URL.revokeObjectURL(blobUrl);
  };
  // 播放音频
  // audio.play();
}
// // 连接
// ws.connect();
// // 同原生方法
// ws.onclose(() => {});
// // 同原生方法
// ws.onerror(() => {});
// // 同原生方法

// // 同原生方法
// ws.onopen(() => {});
// ws.close();
function generateRandomNumber() {
  return Math.floor(Math.random() * 9000000000) + 1000000000;
}

const send = (text) => {
  // let demo =
  //   '{"session_id": "381665d8-31f6-11ef-894a-52540037edd7", "message_id": "3b46df26-31f6-11ef-894a-52540037edd7", "action": "ACTION_SYNTHESIS", "data": "\u5355\u662f\u5468\u56f4\u77ed\u77ed\u7684\u6ce5\u5899\u6839\u4e00\u5e26\uff0c\u5c31\u6709\u65e0\u9650\u8da3\u5473\u3002"}';
  sendObj.data = text;
  // sendObj.data = dataToUnicode(text);

  sendObj.session_id = generateRandomNumber();
  sendObj.message_id = generateRandomNumber();
  ws.send(JSON.stringify(sendObj));
  console.log(
    "%c [ JSON.stringify(sendObj) ]-240-「HelloWorld」",
    "font-size:13px; background:pink; color:#bf2c9f;",
    JSON.stringify(sendObj)
  );
};
</script>

<template>
  <div>
    <input type="text" v-model="inputText" />
    <button @click="client()">点击链接</button>
    <button @click="send(inputText)">点击发送</button>
    <button @click="playBlob(blobs)">点击播放</button>
    <audio controls v-if="isShow">
      <source :src="blobUr" type="audio/mpeg" autoplay />
      <!-- <source
        src="https://m701.music.126.net/20240818140313/4e79f4a4f2c2c6392119edd74fc4e550/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/12363111287/9f5c/ccf4/6918/626c295d5fc9cae55c5b65c2a3f6829e.mp3"
        type="audio/mpeg"
      /> -->
      Your browser does not support the audio element.
    </audio>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

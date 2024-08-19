<script setup>
import { ref, onMounted, reactive } from "vue";
import { WebSocketClient } from "../utils/websoket/index";
import { TencentTTS } from "../utils/TTS";

defineProps({
  msg: String,
});

let currentTime = new Date();
currentTime.setMinutes(currentTime.getMinutes() + 30);
let timestampAfter30Minutes = Math.floor(currentTime.getTime() / 1000); // 转换为秒级时间戳
let inputText = ref("床前明月光，疑是地上霜。");

const secretKey = "30lJkIm4BA9Z8hDTXXSDsSyOjx4A8udE";
let sendObj = {
  session_id: "",
  message_id: "",
  action: "ACTION_SYNTHESIS",
  data: "",
};

// todo 升级唯一session_id 标识 根据session_id 拼接blobs
const TTSClient = reactive({
  session_id: null,
  type: 2,
  ws: null,
  blobs: [],
});

const type = {
  0: "连接失败",
  1: "连接成功，准备完成",
  2: "未连接",
  3: "发送中",
  4: "发送成功",
  5: "已经关闭",
};
const client = async () => {
  const tencentTTS = new TencentTTS({}, secretKey);
  let TENCENT_TTS_WS_URL = await tencentTTS.buildUrl();
  let ws = (TTSClient.ws = new WebSocketClient(TENCENT_TTS_WS_URL));

  ws.connect();
  ws.onmessage((res) => {
    if (res.data instanceof Blob) {
      TTSClient.blobs.push(res.data);
    } else {
      let data = JSON.parse(res.data);
      if (data.final) {
        // 表示合成完毕 需要关闭连接
        TTSClient.type = 5;
        ws.close();
      }
      if (data.ready === 1) {
        console.log(
          "%c [ 准备完成，可以发送文本 ]-120-「HelloWorld」",
          "font-size:13px; background:pink; color:#bf2c9f;",
          data.ready
        );
        TTSClient.type = 1;
      }
    }
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
const clientMore = async () => {
  console.log("[ clientMore ]-75-「HelloWorld」开始");
  const TTSList = ref({});

  for (let i = 0; i < 10; i++) {
    new Promise((resolve, reject) => {
      const tencentTTS = new TencentTTS({}, secretKey);
      tencentTTS
        .buildUrl()
        .then((TENCENT_TTS_WS_URL) => {
          const ws = new WebSocketClient(TENCENT_TTS_WS_URL);
          ws.connect();

          TTSList.value[i] = {
            key: i,
            ws,
            type: 2,
            blobs: [],
          };

          ws.onmessage = (res) => {
            if (res.data instanceof Blob) {
              TTSList.value[i].blobs.push(res.data);
            } else {
              const data = JSON.parse(res.data);
              if (data.final) {
                TTSList.value[i].type = 5;
                ws.close();
              }
              if (data.ready === 1) {
                console.log(
                  "[ 准备完成，可以发送文本 ]-120-「HelloWorld」",
                  data.ready
                );

                TTSList.value[i].type = 1;
                if (i === 9) {
                  console.log(
                    "[ clientMore ]-75-「HelloWorld」结束",
                    TTSList.value
                  );
                  resolve();
                } else {
                  console.log("[ clientMore ]-75-「HelloWorld」进行中", i);
                }
              }
            }
          };

          ws.onerror = (error) => {
            console.error("[ WebSocket error ]", error);
            reject(error);
          };
        })
        .catch((error) => {
          console.error("[ error ]-110-「HelloWorld」", error);
          reject(error);
        });
    });
  }

  console.log("[ clientMore ]-75-「HelloWorld」结束", TTSList.value);
  return TTSList.value;
};
let isShow = ref(false);
let blobUr = ref("");
// 创建一个函数来播放 Blob
function playBlob(blob) {
  isShow.value = false;
  let blobs = [...TTSClient.blobs];
  const newBolb = new Blob(blobs, { type: "audio/mp3" });
  // 将 Blob 转换为 URL
  const blobUrl = URL.createObjectURL(newBolb);
  blobUr.value = blobUrl;
  // isShow.value = true;
  // 创建一个新的 audio 元素
  const audio = new Audio(blobUrl);
  audio.play();
  // 当音频播放完毕后，释放 URL 对象
  audio.onended = function () {
    URL.revokeObjectURL(blobUrl);
  };
  // 播放音频
  // audio.play();
}

const send = (text) => {
  if (!text) {
    return;
  } else {
    text += "。";
  }
  // 清理历史blob
  TTSClient.blobs = [];
  sendObj.data = text;
  // sendObj.session_id = generateRandomNumber();
  // sendObj.message_id = generateRandomNumber();
  if (TTSClient.type === 0 || TTSClient.type === 2) {
    console.log(
      "%c [ send ]-183-「HelloWorld」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      "请先连接"
    );
    return;
  }
  TTSClient.ws.send(JSON.stringify(sendObj));
  console.log(
    "%c [ JSON.stringify(sendObj) ]-240-「HelloWorld」",
    "font-size:13px; background:pink; color:#bf2c9f;",
    JSON.stringify(sendObj)
  );
};
</script>

<template>
  <div class="container">
    <input type="text" v-model="inputText" />
    <button @click="client()">点击链接TTS({{ type[TTSClient.type] }})</button>
    <button @click="clientMore()">同时连接100个</button>
    <button @click="send(inputText)">点击发送</button>
    <button @click="playBlob">点击播放</button>
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
.container {
  display: flex;
  gap: 10px;
}
</style>

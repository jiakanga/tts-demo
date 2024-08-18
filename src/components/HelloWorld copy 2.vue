<script setup>
import { ref, onMounted } from "vue";
import { WebSocketClient } from "../utils/websoket/index";

defineProps({
  msg: String,
});

const blobs = ref([]);

class TencentTTS {
  constructor(options, secretKey) {
    this.options = options;
    this.secretKey = secretKey;
    this.params = this.generateParams(options);
    this.secretString = `GETtts.cloud.tencent.com/stream_wsv2?${this.params}`;
  }

  generateParams(options) {
    return Object.keys(options)
      .map((key) => `${key}=${options[key]}`)
      .join("&");
  }
  generateEncodeURIParams(options) {
    return Object.keys(options)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`
      )
      .join("&");
  }

  async generateSignature() {
    const Signature = await this.hmacSha1AndBase64(
      this.secretString,
      this.secretKey
    );
    return Signature;
  }

  async hmacSha1AndBase64(secretString, secretKey) {
    // 将密钥和数据转换为UTF-8编码的字节数组
    const keyBuffer = new TextEncoder().encode(secretKey);
    const dataBuffer = new TextEncoder().encode(secretString);

    // 创建HMAC-SHA1算法的密钥对象
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw", // 密钥格式
      keyBuffer, // 密钥字节数组
      {
        name: "HMAC",
        hash: "SHA-1", // 使用SHA-1哈希函数
      },
      false, // 密钥是否用于加密操作
      ["sign"] // 密钥用途
    );

    // 使用密钥和数据生成HMAC-SHA1签名
    const signature = await window.crypto.subtle.sign(
      {
        name: "HMAC", // 使用HMAC算法
      },
      keyMaterial, // 使用上面创建的密钥
      dataBuffer // 数据字节数组
    );

    // 将签名转换为Base64字符串
    const signatureArray = new Uint8Array(signature);
    const base64Signature = btoa(String.fromCharCode(...signatureArray));

    return base64Signature;
  }

  async buildUrl() {
    const Signature = await this.generateSignature();
    this.options.Signature = Signature;
    this.newParams = this.generateEncodeURIParams(this.options);
    return `wss://tts.cloud.tencent.com/stream_wsv2?${this.newParams}`;
  }
}

let currentTime = new Date();
currentTime.setMinutes(currentTime.getMinutes() + 30);
let timestampAfter30Minutes = Math.floor(currentTime.getTime() / 1000); // 转换为秒级时间戳
let inputText = ref("给爷嘬一口33。");
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
  const tencentTTS = new TencentTTS(options, secretKey);
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
  console.log(
    "%c [ blob ]-156-「HelloWorld」",
    "font-size:13px; background:pink; color:#bf2c9f;",
    blob
  );

  // 将 Blob 转换为 URL
  const blobUrl = URL.createObjectURL(newBolb);
  blobUr.value = blobUrl;
  isShow.value = true;
  console.log(
    "%c [ blobUrl ]-142-「HelloWorld」",
    "font-size:13px; background:pink; color:#bf2c9f;",
    blobUrl
  );

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

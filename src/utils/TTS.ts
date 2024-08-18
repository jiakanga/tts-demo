export class TencentTTS {
  secretKey = "GETtts.cloud.tencent.com/stream_wsv2?";
  secretString = "GETtts.cloud.tencent.com/stream_wsv2?";
  wssURL = "wss://tts.cloud.tencent.com/stream_wsv2?";

  Timestamp = Math.floor(new Date().getTime() / 1000);

  options = {
    Action: "TextToStreamAudioWSv2",
    AppId: 1328786870,
    Codec: "mp3",
    EnableSubtitle: "True",
    Expired: this.Timestamp + 36000,
    SampleRate: 16000,
    SecretId: "AKIDoTvDIAMuOzR4gOjw0zZ0JUYVWWfjgXUS",
    SessionId: this.generateRandomNumber(),
    Speed: 0,
    Timestamp: this.Timestamp, // 确保是秒级时间戳
    VoiceType: 101001,
    Volume: 0,
  };

  constructor(opt, secretKey) {
    this.options = { ...this.options, ...opt };
    this.secretKey = secretKey;
  }

  generateRandomNumber() {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
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
    let str = this.secretString + this.generateParams(this.options);
    console.log(
      "%c [ str ]-48-「TTS」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      str
    );
    const Signature = await this.hmacSha1AndBase64(str, this.secretKey);
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
    console.log(
      "%c [ base64Signature ]-42-「index」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      base64Signature
    );

    return base64Signature;
  }

  async buildUrl() {
    const Signature = await this.generateSignature();
    let newParams = this.generateEncodeURIParams({
      ...this.options,
      Signature,
    });
    return this.wssURL + newParams;
  }
}

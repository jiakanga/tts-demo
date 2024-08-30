// 音频实时播放
class AudioPlayer {
  mediaSource: MediaSource; // 媒体资源
  audio: HTMLAudioElement; // 音频元素
  audioContext: AudioContext; // 音频上下文
  sourceBuffer?: SourceBuffer; // 音频数据缓冲区
  cacheBuffers: ArrayBuffer[] = []; // 音频数据列表
  pauseTimer: number | null | any = null; // 暂停定时器

  constructor() {
    const AudioContext = window.AudioContext;
    this.audioContext = new AudioContext();

    this.mediaSource = new MediaSource();

    this.audio = new Audio();
    this.audio.src = URL.createObjectURL(this.mediaSource);

    this.audioContextConnect();
    this.listenMedisSource();
  }

  // 连接音频上下文
  private audioContextConnect() {
    const source = this.audioContext.createMediaElementSource(this.audio);
    source.connect(this.audioContext.destination);
  }

  // 监听媒体资源
  private listenMedisSource() {
    this.mediaSource.addEventListener("sourceopen", () => {
      if (this.sourceBuffer) return;

      this.sourceBuffer = this.mediaSource.addSourceBuffer("audio/mpeg");

      this.sourceBuffer.addEventListener("update", () => {
        if (this.cacheBuffers.length && !this.sourceBuffer?.updating) {
          const cacheBuffer = this.cacheBuffers.shift()!;
          this.sourceBuffer?.appendBuffer(cacheBuffer);
        }

        this.pauseAudio();
      });
    });
  }

  // 暂停音频
  private pauseAudio() {
    const neePlayTime =
      this.sourceBuffer!.timestampOffset - this.audio.currentTime || 0;

    this.pauseTimer && clearTimeout(this.pauseTimer);
    // 播放完成5秒后还没有新的音频流过来，则暂停音频播放
    this.pauseTimer = setTimeout(
      () => this.audio.pause(),
      neePlayTime * 1000 + 5000
    );
  }

  private playAudio() {
    // 为防止下一段音频流传输过来时，上一段音频已经播放完毕，造成音频卡顿现象，
    // 这里做了1秒的延时，可根据实际情况修正
    setTimeout(() => {
      if (this.audio.paused) {
        try {
          this.audio.play();
        } catch (e) {
          this.playAudio();
        }
      }
    }, 1000);
  }

  // 接收音频数据
  public receiveAudioData(audioData: ArrayBuffer) {
    console.log(
      "%c [ audioData.byteLength ]-77-「AudioPlayer」",
      "font-size:13px; background:pink; color:#bf2c9f;",
      audioData.byteLength,
      audioData
    );

    if (!audioData.byteLength) return;

    if (this.sourceBuffer?.updating) {
      this.cacheBuffers.push(audioData);
    } else {
      this.sourceBuffer?.appendBuffer(audioData);
    }

    this.playAudio();
  }
}

export default AudioPlayer;

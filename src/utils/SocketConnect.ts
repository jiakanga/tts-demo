// const BASE_URL = import.meta.env.VITE_WS_BASE_URL;

type ObserverType<T> = {
  type: string;
  callback: (data: T) => void;
};

class SocketConnect<T> {
  private url: string;
  public ws: WebSocket | undefined; //websocket实例
  private observers: ObserverType<T>[] = []; //消息订阅者列表
  private waitingMessages: string[] = []; //待执行命令列表
  private openCb?: () => void;

  constructor(url = "", openCb?: () => void) {
    this.url = url;
    if (openCb) this.openCb = openCb;
    this.connect();
  }

  //websocket连接
  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.openCb && this.openCb();
      // 发送所有等待发送的信息
      const length = this.waitingMessages.length;
      for (let i = 0; i < length; ++i) {
        const message = this.waitingMessages.shift();
        this.send(message);
      }
    };

    this.ws.onclose = (event) => {
      console.log("webSocket closed:", event);
    };

    this.ws.onerror = (error) => {
      console.log("webSocket error:", error);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.observers.forEach((observer) => {
        observer.callback(event.data);
      });
    };
  }

  //发送信息
  send(message?: string) {
    if (message) {
      //发送信息时若websocket还未连接，则将信息放入待发送信息中等待连接成功后发送
      if (this.onReady() !== WebSocket.OPEN) {
        this.waitingMessages.push(message);
        return this;
      }

      this.ws && this.ws.send(message);
    }

    return this;
  }

  //订阅webSocket信息
  observe(callback: (data: T) => void, type = "all") {
    const observer = { type, callback };
    this.observers.push(observer);

    return observer;
  }

  //取消订阅信息
  cancelObserve(cancelObserver: ObserverType<T>) {
    this.observers.forEach((observer, index) => {
      if (cancelObserver === observer) {
        this.observers.splice(index, 1);
      }
    });
  }

  // 关闭websocket
  close() {
    this.ws && this.ws.close();
  }

  // websocket连接状态
  onReady() {
    return this.ws && this.ws.readyState;
  }
}

export default SocketConnect;

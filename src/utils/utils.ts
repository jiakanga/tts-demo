// 从十六进制字符串转换为字节数组
export function hexStringToByteArray(hexString: string): Uint8Array {
  const byteArray: number[] = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return new Uint8Array(byteArray);
}

// 从字节数组转换为 ArrayBuffer
export function byteArrayToArrayBuffer(byteArray: Uint8Array): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(byteArray.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  uint8Array.set(byteArray);
  return arrayBuffer;
}

// 从十六进制字符串转换为 ArrayBuffer
export function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  return byteArrayToArrayBuffer(hexStringToByteArray(hexString));
}

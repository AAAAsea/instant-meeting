import { useContext } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { SocketContext } from "../contexts/SocketContext";

export default (stream) => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {

    if (!stream || !(stream instanceof MediaStream)) return;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    // 加载 AudioWorklet 并创建处理器
    audioContext.audioWorklet.addModule('/worklet.js').then(() => {
      const processor = new AudioWorkletNode(audioContext, 'volume-processor');
      source.connect(processor);
      processor.port.onmessage = (event) => {
        setVolume(Number(event.data.toFixed(2))); // Float 0-1
      };

      return () => {
        processor.disconnect();
        source.disconnect();
        audioContext.close();
      };
    });
  }, [stream]);

  return volume;
};
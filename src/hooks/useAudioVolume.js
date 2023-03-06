import { useContext } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { SocketContext } from "../contexts/SocketContext";

export default (stream, voiceOpen) => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!voiceOpen) return;
    if (!stream || !(stream instanceof MediaStream) || stream.getAudioTracks().length === 0) return;
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
  }, [voiceOpen, stream]);

  return volume;
};
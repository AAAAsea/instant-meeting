import { useState } from 'react';
import { MessageContext } from "@/contexts/MessageContext";
import { useContext } from 'react';
import { useRef } from 'react';
import { formatDate } from '../utils';
import { SettingsContext } from '../contexts/SettingsContext';

export default function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordInfo, setRecordInfo] = useState({ start: 0, time: 0, size: 0 })

  const mediaRecorder = useRef();
  const fileSize = useRef(0);
  const start = useRef(new Date());
  const fileName = useRef("");
  const stream = useRef(null);

  const { message } = useContext(MessageContext)
  const { recorderMode } = useContext(SettingsContext)

  const download = () => {
    setIsRecording(false);
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = fileName.current;
    downloadAnchor.click();
    setRecordedChunks([]);
    setRecordInfo({ ...recordInfo, time: 0, size: 0 });

  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data); // 添加数据，event.data是一个BLOB对象
      fileSize.current += e.data.size;
      setRecordInfo({ ...recordInfo, time: ~~((new Date() - start.current) / 1000), size: fileSize.current });
    } else {
    }
  };

  const handlePaused = () => {
    console.log("paused")
  }

  const handleRecord = async () => {
    if (!isRecording) {
      // 录制主视频
      if (!recorderMode) {
        const mainVideo = document.getElementsByClassName("main-video")[0];
        if (!mainVideo) return;
        stream.current = mainVideo.srcObject;
        const mainVideoWrapper = document.getElementsByClassName('main-video-wrapper')[0];
        if (!stream.current || !stream.current.active || mainVideoWrapper.style.visibility === 'hidden') {
          message.warning("当前没有正在观看的视频");
          return;
        }
      } else {
        stream.current = await startCapture() // 录制屏幕
      }

      stream.current.getVideoTracks()[0].onended = () => {
        mediaRecorder.current.stop();
      };

      setIsRecording(true);
      fileSize.current = 0;
      start.current = new Date();
      const options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorder.current = new MediaRecorder(stream.current, options);
      mediaRecorder.current.ondataavailable = handleDataAvailable;
      mediaRecorder.current.onstop = download;
      mediaRecorder.current.onpaused = handlePaused
      mediaRecorder.current.start(100); // 默认在结束的时候产生一个blob，100代表每100ms产生一次
      fileName.current = formatDate(new Date(), 'YY-MM-DD hh-mm-ss') + '.webm'
    } else {
      setIsRecording(false);
      mediaRecorder.current.stop();

      if (!stream.current) return;
      const oldVideoTrack = stream.current.getVideoTracks()[0];
      oldVideoTrack && oldVideoTrack.stop();
      // 如果关闭的是屏幕共享，则暂停声音
      if (recorderMode) {
        const oldAudioTrack = stream.current.getAudioTracks()[0];
        oldAudioTrack && oldAudioTrack.stop();
      }
    }
  };

  async function startCapture() {
    let captureStream = null;
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch (err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }

  return [isRecording, handleRecord, recordInfo]
}
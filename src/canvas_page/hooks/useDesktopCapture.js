export default async ()=>{
  
  const {width, height } = await window.electron.ipcRenderer.invoke('getScreenSize');

  // 使用 MediaDevices.getUserMedia API 获取屏幕截图
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        maxWidth: width,
        maxHeight: height
      }
    }
  });

  // 创建一个 video 元素来显示屏幕截图
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.onloadedmetadata = () => {
    // 创建一个 canvas 元素来渲染屏幕截图
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    document.body.appendChild(canvas)

    // 将 canvas 转换为图像数据
    const imageData = canvas.toDataURL('image/png');

    window.electron.ipcRenderer.send('desktopCapture',imageData)

    // 关闭屏幕捕获流
    stream.getTracks()[0].stop();
  };

  document.body.appendChild(video)

}
import { Button } from '@mui/material'
import { ButtonGroup } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import { SocketContext } from '@/contexts/SocketContext'
import { MessageContext } from '@/contexts/MessageContext'
import './index.css'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Mic, MicOff } from '@mui/icons-material';
import { Videocam } from '@mui/icons-material'
import { VideocamOff } from '@mui/icons-material'
import { ScreenShare } from '@mui/icons-material'
import { StopScreenShare } from '@mui/icons-material'
import { Share } from '@mui/icons-material'


const BottomNavBar = () => {
  const { initMyVideo, me, myVideo, shutOffMyVideo, initMyVoice, voiceOpen, videoOpen, videoType, room } = useContext(SocketContext);
  const { message } = useContext(MessageContext);

  const share = () => {
    console.log(room)
    message.success('房间ID已复制，快去分享吧~')
  }

  return (
    <div id="bottom">
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => { initMyVoice(!voiceOpen) }} startIcon={voiceOpen ? <Mic /> : <MicOff />}>{
          voiceOpen ? '关闭话筒' : '打开话筒'
        }</Button>
        <Button
          color={(videoOpen && videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 1, quality: 'h', open: !videoOpen || !videoType }) }}
          startIcon={videoOpen && videoType ? <Videocam /> : <VideocamOff />}
        >{
            videoOpen && videoType ? '关闭摄像头' : '打开摄像头'
          }</Button>
        <Button
          color={(videoOpen && !videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 0, quality: 'h', open: !videoOpen || videoType }) }}
          startIcon={videoOpen && !videoType ? <StopScreenShare /> : <ScreenShare />}
        >{
            videoOpen && !videoType ? '关闭共享' : '共享屏幕'
          }</Button>
        <CopyToClipboard text={room}>
          <Button onClick={share} startIcon={<Share />}>分享</Button>
        </CopyToClipboard>
      </ButtonGroup>
    </div >
  )
}

export default BottomNavBar
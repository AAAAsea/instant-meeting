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
import { IconButton } from '@mui/material'
import { Fullscreen } from '@mui/icons-material'

const BottomNavBar = (props) => {
  const { initMyVideo, me, myVideo, shutOffMyVideo, initMyVoice, voiceOpen, videoOpen, videoType, room } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  // eslint-disable-next-line react/prop-types
  const { mainVideoRef } = props ;

  const share = () => {
    console.log(room)
    message.success('房间号已复制，快去分享吧~')
  }

  return (
    <div id="bottom">
      <ButtonGroup className='menu-btns' variant="contained" aria-label="outlined primary button group">
        <IconButton
          color={(voiceOpen) ? "error" : "primary"}
          onClick={() => { initMyVoice(!voiceOpen) }}>{
            voiceOpen ? <Mic /> : <MicOff />
          }</IconButton>
        <IconButton
          color={(videoOpen && videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 1, quality: 'h', open: !videoOpen || !videoType }) }}
        >{
            videoOpen && videoType ? <Videocam /> : <VideocamOff />
          }</IconButton>
        <IconButton
          color={(videoOpen && !videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 0, quality: 'h', open: !videoOpen || videoType }) }}
        >{
            videoOpen && !videoType ? <ScreenShare /> : <StopScreenShare />
          }</IconButton>
        <IconButton
          color="primary"
          // eslint-disable-next-line react/prop-types
          onClick={() => { mainVideoRef.current.requestFullscreen() }}
        >
          <Fullscreen />
        </IconButton>
        <CopyToClipboard text={room}>
          <IconButton color='primary' onClick={share}><Share /></IconButton>
        </CopyToClipboard>
      </ButtonGroup>
    </div >
  )
}

export default BottomNavBar
import React from 'react'
import { useContext } from 'react'
import './index.css'
import CopyToClipboard from 'react-copy-to-clipboard'

import { ButtonGroup } from '@mui/material'
import { SocketContext } from '@/contexts/SocketContext'
import { MessageContext } from '@/contexts/MessageContext'
import { IconButton } from '@mui/material'
import { useMemo } from 'react'
import { MicRounded } from '@mui/icons-material'
import { MicOffRounded } from '@mui/icons-material'
import { VideocamRounded } from '@mui/icons-material'
import { VideocamOffRounded } from '@mui/icons-material'
import { ScreenShareRounded } from '@mui/icons-material'
import { StopScreenShareRounded } from '@mui/icons-material'
import { ShareRounded } from '@mui/icons-material'
import { FullscreenRounded } from '@mui/icons-material'

const BottomNavBar = (props) => {
  const { initMyVideo, initMyVoice, voiceOpen, videoOpen, videoType, room } = useContext(SocketContext);
  const { message } = useContext(MessageContext);
  // eslint-disable-next-line react/prop-types
  const { mainVideoRef } = props;

  const shareLink = useMemo(() => `房间号：${room}\n房间链接：${location.href}\n快来加入我的房间吧！`, [room])
  const share = () => {
    console.log(room)
    message.success('房间已复制，快去分享吧~')
  }

  return (
    <div id="bottom">
      <ButtonGroup className='menu-btns animate__animated animate__slideInUp' variant="contained" aria-label="outlined primary button group">
        <IconButton
          color={(voiceOpen) ? "error" : "primary"}
          onClick={() => { initMyVoice(!voiceOpen) }}>{
            voiceOpen ? <MicRounded /> : <MicOffRounded />
          }</IconButton>
        <IconButton
          color={(videoOpen && videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 1, quality: 'h', open: !videoOpen || !videoType }) }}
        >{
            videoOpen && videoType ? <VideocamRounded /> : <VideocamOffRounded />
          }</IconButton>
        <IconButton
          color={(videoOpen && !videoType) ? "error" : "primary"}
          onClick={() => { initMyVideo({ type: 0, quality: 'h', open: !videoOpen || videoType }) }}
        >{
            videoOpen && !videoType ? <ScreenShareRounded /> : <StopScreenShareRounded />
          }</IconButton>
        <IconButton
          color="primary"
          // eslint-disable-next-line react/prop-types
          onClick={() => { mainVideoRef.current.requestFullscreen() }}
        >
          <FullscreenRounded />
        </IconButton>
        <CopyToClipboard text={shareLink}>
          <IconButton color='primary' onClick={share}><ShareRounded /></IconButton>
        </CopyToClipboard>
      </ButtonGroup>
    </div >
  )
}

export default BottomNavBar
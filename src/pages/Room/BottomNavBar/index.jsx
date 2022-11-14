import { Button } from '@mui/material'
import { ButtonGroup } from '@mui/material'
import React from 'react'
import { useContext } from 'react'
import { SocketContext } from '@/contexts/SocketContext'
import { MessageContext } from '@/contexts/MessageContext'
import './index.css'
import CopyToClipboard from 'react-copy-to-clipboard'
const BottomNavBar = () => {
  const { initMyVideo, me, myVideo, shutOffMyVideo } = useContext(SocketContext);
  const { message } = useContext(MessageContext);

  const share = () => {
    console.log('me', me.current)
    message.success('房间ID已复制，快去分享吧~')
  }

  return (
    <div id="bottom">
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => { myVideo ? shutOffMyVideo() : initMyVideo({ type: 1, quality: 'h' }) }}>{
          myVideo ? '关闭摄像头' : '打开摄像头'
        }</Button>
        <Button onClick={() => { initMyVideo({ type: 0, quality: 'h' }) }}>共享屏幕</Button>
        <CopyToClipboard text={me.current}>
          <Button onClick={share}>分享</Button>
        </CopyToClipboard>
      </ButtonGroup>
    </div >
  )
}

export default BottomNavBar